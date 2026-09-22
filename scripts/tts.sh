#!/usr/bin/env bash
# Render one script to m4a.
# Production audio is scripts/render_pending_audio.py in GitHub Actions.
# This script is the Mac fallback for a proof clip.
# Usage: scripts/tts.sh script.txt out.m4a
set -euo pipefail
if [[ $# -ne 2 ]]; then
  echo "usage: scripts/tts.sh script.txt out.m4a" >&2
  exit 2
fi
script=$1
out=$2
root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

if [[ -n "${XAI_API_KEY:-}" ]]; then
  voice=$(python3 -c 'import json; print(json.load(open("'"$root"'/podcast.json")).get("tts_voice_id","eve"))')
  python3 - "$script" "$tmp/speech.mp3" "$voice" << 'PY'
import json, os, sys, urllib.request
text = open(sys.argv[1]).read().strip()
body = json.dumps({"text": text, "voice_id": sys.argv[3], "language": "en"}).encode()
req = urllib.request.Request(
    "https://api.x.ai/v1/tts",
    data=body,
    headers={"Authorization": f"Bearer {os.environ['XAI_API_KEY']}", "Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req, timeout=180) as resp:
    open(sys.argv[2], "wb").write(resp.read())
PY
  ffmpeg -y -i "$tmp/speech.mp3" -c:a aac -b:a 192k -ar 44100 -ac 1 "$out"
  echo "wrote $out via xAI TTS"
  exit 0
fi

if ! say -v '?' 2>/dev/null | grep -q 'Jamie (Premium)'; then
  echo "tts.sh: no XAI_API_KEY and no Jamie (Premium) voice. Refusing to publish a robotic read." >&2
  exit 1
fi
say -v "Jamie (Premium)" -o "$tmp/speech.aiff" -f "$script"
# say writes 22 kHz. Bitrate is only accepted after resampling to 44.1 kHz.
afconvert "$tmp/speech.aiff" "$out" -d aac@44100 -f m4af -b 192000
echo "wrote $out via Jamie (Premium). Unattended episodes use xAI voice id in podcast.json once XAI_API_KEY is set."
