#!/usr/bin/env python3
"""Render episode scripts to m4a with the xAI Text to Speech API.

This is the laptop-closed path. GitHub Actions runs it when XAI_API_KEY is
set as a repository secret. It does not read a key from the repo. Proof clips
are skipped. Episodes that already have audio are skipped.
"""
from __future__ import annotations

import json
import os
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.x.ai/v1/tts"


def voice_id() -> str:
    cfg = json.loads((ROOT / "podcast.json").read_text())
    return str(cfg.get("tts_voice_id") or "eve")


def api_key() -> str:
    key = os.environ.get("XAI_API_KEY", "").strip().strip('"').strip("'")
    if key.lower().startswith("bearer "):
        key = key[7:].strip()
    return key


def render(text: str, mp3: Path, key: str) -> None:
    body = json.dumps(
        {
            "text": text,
            "voice_id": voice_id(),
            "language": "en",
            "text_normalization": True,
        }
    ).encode()
    req = urllib.request.Request(
        API,
        data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            mp3.write_bytes(resp.read())
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace")[:1000]
        raise RuntimeError(f"TTS HTTP {err.code}: {detail}") from None


def to_m4a(mp3: Path, m4a: Path) -> int:
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(mp3),
            "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "1",
            str(m4a),
        ],
        check=True,
        capture_output=True,
    )
    probe = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=nw=1:nk=1", str(m4a),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return max(1, round(float(probe.stdout.strip())))


def main() -> None:
    key = api_key()
    if not key:
        print("XAI_API_KEY is not set. Skipping cloud audio. The paper still publishes.")
        return
    wrote = 0
    failed = 0
    for path in sorted((ROOT / "episodes").glob("*.json")):
        ep = json.loads(path.read_text())
        if ep.get("proof"):
            continue
        script = (ep.get("script") or "").strip()
        if not script:
            continue
        m4a = ROOT / "episodes" / Path(ep["file"]).name
        if m4a.exists():
            continue
        if len(script) > 60000:
            print(f"FAILED {path.name}: script is over the 60,000 character TTS limit")
            failed += 1
            continue
        mp3 = m4a.with_suffix(".mp3")
        print(f"rendering {m4a.name} with voice {voice_id()}")
        try:
            render(script, mp3, key)
            ep["duration"] = to_m4a(mp3, m4a)
            path.write_text(json.dumps(ep, indent=2) + "\n")
            wrote += 1
        except Exception as exc:
            m4a.unlink(missing_ok=True)
            print(f"FAILED {path.name}: {exc}")
            print("Audio did not render. The paper still publishes. If the message says the API key is incorrect, replace the XAI_API_KEY repository secret.")
            failed += 1
        finally:
            mp3.unlink(missing_ok=True)
    print(f"rendered {wrote} episode(s)")
    if failed:
        raise SystemExit(f"{failed} episode(s) failed")


if __name__ == "__main__":
    main()
