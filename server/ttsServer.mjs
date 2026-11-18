/**
 * Secure Backend Text-to-Speech API & Multi-Provider Proxy for NetFold 3D.
 *
 * Supported providers (configured server-side via environment variables — NEVER exposed to frontend):
 *   1) google_cloud_tts  (when GOOGLE_TTS_API_KEY is set -> official Google Cloud TTS en-IN/kn-IN/ta-IN/te-IN/hi-IN)
 *   2) bhashini_ulca     (when BHASHINI_USER_ID + BHASHINI_ULCA_API_KEY are set -> MeitY Bhashini / Dhruva Indic TTS)
 *   3) local_mms_onnx    (self-hosted Meta MMS-TTS VITS ONNX via sherpa-onnx worker covering all 5 languages locally)
 *
 * Caches generated audio on disk (.tts-cache/) so identical sentences do not regenerate unnecessarily.
 */

import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')
const CACHE_DIR = path.join(PROJECT_ROOT, '.tts-cache')
const WORKER_SCRIPT = path.join(__dirname, 'mms_tts_worker.py')
const TTS_PORT = Number(process.env.TTS_PORT || 8787)

const SUPPORTED_LANGUAGES = ['en', 'kn', 'ta', 'te', 'hi']

const GOOGLE_VOICE_MAP = {
  en: { languageCode: 'en-IN', name: 'en-IN-Neural2-A' },
  kn: { languageCode: 'kn-IN', name: 'kn-IN-Wavenet-A' },
  ta: { languageCode: 'ta-IN', name: 'ta-IN-Wavenet-A' },
  te: { languageCode: 'te-IN', name: 'te-IN-Standard-A' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A' },
}

fs.mkdirSync(CACHE_DIR, { recursive: true })

// Persistent Python sherpa-onnx worker queue
let workerProc = null
let workerStdoutBuffer = ''
let reqSeq = 1
const pendingRequests = new Map()
let cachedBhashiniConfig = null

function ensureLocalWorker() {
  if (workerProc && !workerProc.killed) return workerProc

  const pythonCmd = process.env.PYTHON_TTS_BIN || 'py'
  const pythonArgs =
    process.env.PYTHON_TTS_BIN ? [WORKER_SCRIPT] : ['-3.12', WORKER_SCRIPT]

  workerProc = spawn(pythonCmd, pythonArgs, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  })

  workerProc.stdout.on('data', (chunk) => {
    workerStdoutBuffer += chunk.toString('utf8')
    const lines = workerStdoutBuffer.split('\n')
    workerStdoutBuffer = lines.pop() ?? ''
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) continue
      try {
        const msg = JSON.parse(line)
        if (msg.ready) continue
        const pending = pendingRequests.get(msg.id)
        if (pending) {
          pendingRequests.delete(msg.id)
          pending.resolve(msg)
        }
      } catch {
        // Ignore non-JSON diagnostic lines
      }
    }
  })

  workerProc.on('exit', () => {
    for (const [, p] of pendingRequests) {
      p.reject(new Error('local_tts_worker_exited'))
    }
    pendingRequests.clear()
    workerProc = null
  })

  return workerProc
}

function sendWorkerRequest(payload, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const proc = ensureLocalWorker()
    const id = reqSeq++
    const timer = setTimeout(() => {
      pendingRequests.delete(id)
      reject(new Error('local_tts_worker_timeout'))
    }, timeoutMs)

    pendingRequests.set(id, {
      resolve: (val) => {
        clearTimeout(timer)
        resolve(val)
      },
      reject: (err) => {
        clearTimeout(timer)
        reject(err)
      },
    })

    proc.stdin.write(`${JSON.stringify({ id, ...payload })}\n`, 'utf8')
  })
}

async function synthesizeGoogleCloudTts({ text, language, rate }) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) return null

  const voiceCfg = GOOGLE_VOICE_MAP[language] ?? GOOGLE_VOICE_MAP.en
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: voiceCfg.languageCode, name: voiceCfg.name },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.5, Math.min(2.0, Number(rate) || 1)),
        },
      }),
    },
  )

  if (!res.ok) {
    throw new Error(`google_tts_http_${res.status}`)
  }
  const data = await res.json()
  if (!data?.audioContent) {
    throw new Error('google_tts_empty_audio')
  }
  return {
    buffer: Buffer.from(data.audioContent, 'base64'),
    contentType: 'audio/mpeg',
    ext: 'mp3',
    provider: 'google_cloud_tts',
    voiceName: voiceCfg.name,
  }
}

async function getBhashiniTtsPipeline(langCode) {
  const userID = process.env.BHASHINI_USER_ID
  const ulcaApiKey = process.env.BHASHINI_ULCA_API_KEY
  if (!userID || !ulcaApiKey) return null

  if (cachedBhashiniConfig?.[langCode]) {
    return cachedBhashiniConfig[langCode]
  }

  const configRes = await fetch(
    'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userID,
        ulcaApiKey,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'tts',
            config: { language: { sourceLanguage: langCode } },
          },
        ],
        pipelineRequestConfig: {
          pipelineId: process.env.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd',
        },
      }),
    },
  )

  if (!configRes.ok) {
    throw new Error(`bhashini_config_http_${configRes.status}`)
  }
  const cfg = await configRes.json()
  const entry = {
    callbackUrl:
      cfg?.pipelineInferenceAPIEndPoint?.callbackUrl ||
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
    authHeaderName:
      cfg?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.name || 'Authorization',
    authHeaderValue: cfg?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || '',
    serviceId: cfg?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId || '',
  }
  cachedBhashiniConfig = { ...(cachedBhashiniConfig ?? {}), [langCode]: entry }
  return entry
}

async function synthesizeBhashiniTts({ text, language }) {
  const pipe = await getBhashiniTtsPipeline(language)
  if (!pipe) return null

  const res = await fetch(pipe.callbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [pipe.authHeaderName]: pipe.authHeaderValue,
    },
    body: JSON.stringify({
      pipelineTasks: [
        {
          taskType: 'tts',
          config: {
            language: { sourceLanguage: language },
            serviceId: pipe.serviceId,
            gender: 'female',
            samplingRate: 16000,
          },
        },
      ],
      inputData: { input: [{ source: text }] },
    }),
  })

  if (!res.ok) {
    throw new Error(`bhashini_infer_http_${res.status}`)
  }
  const data = await res.json()
  const base64Audio = data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent
  if (!base64Audio) {
    throw new Error('bhashini_empty_audio')
  }
  return {
    buffer: Buffer.from(base64Audio, 'base64'),
    contentType: 'audio/wav',
    ext: 'wav',
    provider: 'bhashini_ulca',
    voiceName: pipe.serviceId || `bhashini-${language}`,
  }
}

async function synthesizeLocalMmsOnnx({ text, language, rate, cacheFile }) {
  const result = await sendWorkerRequest({
    action: 'synthesize',
    language,
    text,
    speed: Math.max(0.6, Math.min(1.8, Number(rate) || 1)),
    outPath: cacheFile,
  })
  if (!result.ok) {
    throw new Error(result.error || 'local_mms_synthesis_failed')
  }
  const buffer = fs.readFileSync(result.outPath)
  return {
    buffer,
    contentType: 'audio/wav',
    ext: 'wav',
    provider: 'local_mms_onnx',
    voiceName: `Meta MMS-TTS ONNX (${result.iso})`,
  }
}

export async function handleSynthesize({ text, language = 'en', rate = 1 }) {
  const safeLang = SUPPORTED_LANGUAGES.includes(language) ? language : 'en'
  const cleanText = String(text ?? '').trim()
  if (!cleanText) {
    throw new Error('empty_text')
  }
  const safeRate = Math.max(0.6, Math.min(1.8, Number(rate) || 1))
  const activeCloudProvider = process.env.GOOGLE_TTS_API_KEY
    ? 'google_cloud_tts'
    : process.env.BHASHINI_USER_ID && process.env.BHASHINI_ULCA_API_KEY
      ? 'bhashini_ulca'
      : 'local_mms_onnx'

  const hash = crypto
    .createHash('sha256')
    .update(`${activeCloudProvider}|${safeLang}|${safeRate.toFixed(2)}|${cleanText}`)
    .digest('hex')
  const wavCachePath = path.join(CACHE_DIR, `${hash}.wav`)
  const mp3CachePath = path.join(CACHE_DIR, `${hash}.mp3`)

  if (fs.existsSync(mp3CachePath)) {
    return {
      buffer: fs.readFileSync(mp3CachePath),
      contentType: 'audio/mpeg',
      provider: activeCloudProvider,
      voiceName: `${activeCloudProvider}-${safeLang}`,
      cacheHit: true,
    }
  }
  if (fs.existsSync(wavCachePath)) {
    return {
      buffer: fs.readFileSync(wavCachePath),
      contentType: 'audio/wav',
      provider: activeCloudProvider,
      voiceName: `Meta MMS-TTS ONNX (${safeLang})`,
      cacheHit: true,
    }
  }

  let output = null
  if (activeCloudProvider === 'google_cloud_tts') {
    try {
      output = await synthesizeGoogleCloudTts({
        text: cleanText,
        language: safeLang,
        rate: safeRate,
      })
      fs.writeFileSync(mp3CachePath, output.buffer)
    } catch {
      output = null
    }
  } else if (activeCloudProvider === 'bhashini_ulca') {
    try {
      output = await synthesizeBhashiniTts({ text: cleanText, language: safeLang })
      fs.writeFileSync(wavCachePath, output.buffer)
    } catch {
      output = null
    }
  }

  if (!output) {
    output = await synthesizeLocalMmsOnnx({
      text: cleanText,
      language: safeLang,
      rate: safeRate,
      cacheFile: wavCachePath,
    })
  }

  return {
    buffer: output.buffer,
    contentType: output.contentType,
    provider: output.provider,
    voiceName: output.voiceName,
    cacheHit: false,
  }
}

export async function getServerStatus() {
  let localStatus = { readyLanguages: {} }
  try {
    localStatus = await sendWorkerRequest({ action: 'status' }, 10000)
  } catch {
    localStatus = { readyLanguages: {} }
  }
  return {
    ok: true,
    cloudConfigured: {
      googleCloudTts: Boolean(process.env.GOOGLE_TTS_API_KEY),
      bhashiniUlca: Boolean(
        process.env.BHASHINI_USER_ID && process.env.BHASHINI_ULCA_API_KEY,
      ),
    },
    activeDefaultProvider: process.env.GOOGLE_TTS_API_KEY
      ? 'google_cloud_tts'
      : process.env.BHASHINI_USER_ID && process.env.BHASHINI_ULCA_API_KEY
        ? 'bhashini_ulca'
        : 'local_mms_onnx',
    localMmsOnnxReady: localStatus.readyLanguages ?? {},
    cacheFilesCount: fs.existsSync(CACHE_DIR) ? fs.readdirSync(CACHE_DIR).length : 0,
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 100000) {
        reject(new Error('payload_too_large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

export function createTtsHttpServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.method === 'GET' && req.url === '/api/tts/status') {
      try {
        const status = await getServerStatus()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(status))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: String(err.message || err) }))
      }
      return
    }

    if (req.method === 'POST' && req.url === '/api/tts/synthesize') {
      try {
        const body = await readJsonBody(req)
        const result = await handleSynthesize(body)
        res.writeHead(200, {
          'Content-Type': result.contentType,
          'Content-Length': String(result.buffer.length),
          'X-TTS-Provider': result.provider,
          'X-TTS-Voice': result.voiceName,
          'X-TTS-Cache': result.cacheHit ? 'HIT' : 'MISS',
        })
        res.end(result.buffer)
      } catch (err) {
        const msg = String(err?.message || err)
        res.writeHead(msg === 'empty_text' ? 400 : 502, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ ok: false, error: msg }))
      }
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: 'not_found' }))
  })
}

if (path.resolve(process.argv[1] || '') === __filename) {
  const srv = createTtsHttpServer()
  srv.listen(TTS_PORT, '127.0.0.1', () => {
    console.log(`[NetFold TTS Proxy] Listening cleanly on http://127.0.0.1:${TTS_PORT}`)
  })
}
