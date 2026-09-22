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
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.x.ai/v1/tts"


def voice_id() -> str:
    cfg = json.loads((ROOT / "podcast.json").read_text())
    return str(cfg.get("tts_voice_id") or "eve")


def render(text: str, mp3: Path, key: str) -> None:
    body = json.dumps({"text": text, "voice_id": voice_id(), "language": "en"}).encode()
    req = urllib.request.Request(
        API,
        data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        mp3.write_bytes(resp.read())


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
    key = os.environ.get("XAI_API_KEY", "").strip()
    if not key:
        print("XAI_API_KEY is not set. Skipping cloud audio. The paper still publishes.")
        return
    wrote = 0
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
        if len(script) > 15000:
            raise SystemExit(f"{path.name}: script is over the 15,000 character TTS limit")
        mp3 = m4a.with_suffix(".mp3")
        print(f"rendering {m4a.name} with voice {voice_id()}")
        render(script, mp3, key)
        ep["duration"] = to_m4a(mp3, m4a)
        mp3.unlink(missing_ok=True)
        path.write_text(json.dumps(ep, indent=2) + "\n")
        wrote += 1
    print(f"rendered {wrote} episode(s)")


if __name__ == "__main__":
    main()
