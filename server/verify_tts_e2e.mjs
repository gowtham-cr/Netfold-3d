import { formatMathForSpeech, splitIntoSentences, splitIntoWords } from '../src/utils/mathSpeechFormatter.js'

const BASE_URL = 'http://127.0.0.1:8787'

const status = await fetch(`${BASE_URL}/api/tts/status`).then((r) => r.json())
console.log('SERVER_STATUS:', JSON.stringify(status))

const samples = {
  en: 'Cylinder volume equals V = πr²h. Given r = 3 cm and h = 5 cm, the surface area is 572 cm². Take π = 22/7.',
  kn: 'ಸಿಲಿಂಡರ್ ಘನಫಲ V = πr²h ಆಗಿದೆ. r = 3 cm ಮತ್ತು h = 5 cm ಇದ್ದಾಗ ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ 572 cm² ಆಗುತ್ತದೆ.',
  ta: 'உருளையின் கன அளவு V = πr²h ஆகும். r = 3 cm மற்றும் h = 5 cm எனில் மொத்தப் புறப்பரப்பளவு 572 cm² ஆகும்.',
  te: 'స్థూపం ఘనపరిమాణం V = πr²h అవుతుంది. r = 3 cm మరియు h = 5 cm అయితే మొత్తం ఉపరితల వైశాల్యం 572 cm² అవుతుంది.',
  hi: 'बेलन का आयतन V = πr²h होता है। r = 3 cm और h = 5 cm होने पर संपूर्ण पृष्ठीय क्षेत्रफल 572 cm² होता है।',
}

for (const [lang, raw] of Object.entries(samples)) {
  const formatted = formatMathForSpeech(raw, lang)
  const sentences = splitIntoSentences(raw)
  const words = splitIntoWords(formatted)

  const t0 = performance.now()
  const r1 = await fetch(`${BASE_URL}/api/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: formatted, language: lang, rate: 1 }),
  })
  const buf = Buffer.from(await r1.arrayBuffer())
  const ms1 = Math.round(performance.now() - t0)

  const t1 = performance.now()
  const r2 = await fetch(`${BASE_URL}/api/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: formatted, language: lang, rate: 1 }),
  })
  await r2.arrayBuffer()
  const ms2 = Math.round(performance.now() - t1)

  const header = `${buf.subarray(0, 4).toString('ascii')}/${buf.subarray(8, 12).toString('ascii')}`
  const sampleRate = buf.readUInt32LE(24)
  const numSamples = Math.floor((buf.length - 44) / 2)
  let sumSq = 0
  let peak = 0
  for (let i = 44; i + 1 < buf.length; i += 2) {
    const s = buf.readInt16LE(i) / 32768
    sumSq += s * s
    peak = Math.max(peak, Math.abs(s))
  }
  const rms = Math.sqrt(sumSq / Math.max(1, numSamples))
  const durationSec = Number((numSamples / sampleRate).toFixed(2))

  console.log(
    JSON.stringify({
      lang,
      httpStatus: r1.status,
      provider: r1.headers.get('x-tts-provider'),
      voice: r1.headers.get('x-tts-voice'),
      cache1: r1.headers.get('x-tts-cache'),
      cache2: r2.headers.get('x-tts-cache'),
      ms1,
      ms2,
      header,
      sampleRate,
      bytes: buf.length,
      durationSec,
      rms: Number(rms.toFixed(4)),
      peak: Number(peak.toFixed(4)),
      sentencesCount: sentences.length,
      wordsCount: words.length,
      spokenPreview: formatted,
    }),
  )
}
