#!/usr/bin/env python3
"""
Persistent local neural TTS worker using Sherpa-ONNX + Meta MMS-TTS VITS ONNX models
for English (eng), Kannada (kan), Tamil (tam), Telugu (tel), and Hindi (hin).

Communicates via newline-delimited JSON on stdin/stdout with server/ttsServer.mjs.
Zero PyTorch/CUDA dependencies required; writes standard 16-bit PCM WAV files.
"""

import array
import json
import os
import sys
import wave
import sherpa_onnx

LANG_TO_ISO = {
    "en": "eng",
    "kn": "kan",
    "ta": "tam",
    "te": "tel",
    "hi": "hin",
}

MODELS_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", ".tts-models")
)

_LOADED_ENGINES = {}
_ALLOWED_TOKEN_CHARS = {}


def load_tokens_set(tokens_path: str) -> set:
    chars = set()
    with open(tokens_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\r\n")
            if not line:
                continue
            parts = line.rsplit(" ", 1)
            if parts and parts[0]:
                chars.add(parts[0])
    chars.add(" ")
    return chars


def get_engine(lang_code: str):
    iso = LANG_TO_ISO.get(lang_code, "eng")
    if iso in _LOADED_ENGINES:
        return _LOADED_ENGINES[iso], _ALLOWED_TOKEN_CHARS[iso], iso

    model_dir = os.path.join(MODELS_ROOT, iso)
    model_path = os.path.join(model_dir, "model.onnx")
    tokens_path = os.path.join(model_dir, "tokens.txt")

    if not os.path.isfile(model_path) or not os.path.isfile(tokens_path):
        raise FileNotFoundError(
            f"Missing MMS ONNX model files for {iso} in {model_dir}"
        )

    config = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=model_path,
                lexicon="",
                tokens=tokens_path,
                data_dir="",
            ),
            provider="cpu",
            num_threads=2,
            debug=False,
        ),
        max_num_sentences=1,
    )
    tts = sherpa_onnx.OfflineTts(config)
    allowed = load_tokens_set(tokens_path)

    _LOADED_ENGINES[iso] = tts
    _ALLOWED_TOKEN_CHARS[iso] = allowed
    return tts, allowed, iso


def sanitize_text_for_tokens(text: str, iso: str, allowed: set) -> str:
    s = str(text or "").strip()
    if iso == "eng":
        s = s.lower()
    # Convert sentence/clause punctuation cleanly into natural brief pauses
    for sep in [",", ".", ";", ":", "!", "?", "(", ")", "/", "—", "–", "\n", "\r"]:
        s = s.replace(sep, " ")

    filtered = []
    for ch in s:
        if ch in allowed:
            filtered.append(ch)
        elif ch.lower() in allowed:
            filtered.append(ch.lower())
        else:
            filtered.append(" ")
    out = " ".join("".join(filtered).split())
    return out


def write_pcm16_wav(out_path: str, samples, sample_rate: int):
    int_samples = array.array(
        "h",
        [max(-32767, min(32767, int(float(s) * 32767.0))) for s in samples],
    )
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with wave.open(out_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(int(sample_rate))
        wf.writeframes(int_samples.tobytes())


def handle_request(req: dict) -> dict:
    action = req.get("action", "synthesize")
    if action == "status":
        ready = {}
        for lang_code, iso in LANG_TO_ISO.items():
            mdir = os.path.join(MODELS_ROOT, iso)
            ready[lang_code] = (
                os.path.isfile(os.path.join(mdir, "model.onnx"))
                and os.path.isfile(os.path.join(mdir, "tokens.txt"))
            )
        return {"ok": True, "readyLanguages": ready}

    lang_code = req.get("language", "en")
    text = req.get("text", "")
    speed = float(req.get("speed", 1.0))
    speed = max(0.6, min(1.8, speed))
    out_path = req.get("outPath", "")

    tts, allowed, iso = get_engine(lang_code)
    clean_text = sanitize_text_for_tokens(text, iso, allowed)
    if not clean_text:
        return {"ok": False, "error": "empty_after_sanitization", "iso": iso}

    audio = tts.generate(clean_text, sid=0, speed=speed)
    if not audio.samples or len(audio.samples) == 0:
        return {"ok": False, "error": "zero_audio_samples", "iso": iso}

    write_pcm16_wav(out_path, audio.samples, audio.sample_rate)
    duration_sec = round(len(audio.samples) / float(audio.sample_rate), 3)
    return {
        "ok": True,
        "iso": iso,
        "sampleRate": int(audio.sample_rate),
        "sampleCount": len(audio.samples),
        "durationSec": duration_sec,
        "outPath": out_path,
        "sanitizedText": clean_text,
    }


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
    print(json.dumps({"ready": True}), flush=True)

    for line in sys.stdin:
        raw = line.strip()
        if not raw:
            continue
        req_id = None
        try:
            req = json.loads(raw)
            req_id = req.get("id")
            res = handle_request(req)
            res["id"] = req_id
            print(json.dumps(res, ensure_ascii=False), flush=True)
        except Exception as exc:
            print(
                json.dumps({"id": req_id, "ok": False, "error": str(exc)}),
                flush=True,
            )


if __name__ == "__main__":
    main()
