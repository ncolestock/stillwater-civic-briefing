#!/usr/bin/env bash
# Laptop fallback. Cloud runs do not use this script.
# Grok Automations commit markdown from GitHub. Actions builds the site.
# Use this only when a draft is sitting on the Mac and needs to be pushed.
set -euo pipefail
cd "$(dirname "$0")/.."
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Library/Developer/CommandLineTools}"
python3 scripts/validate_articles.py
python3 scripts/build_feed.py
npm run build
git add src/content/articles episodes feed.xml podcast.json
if git diff --cached --quiet; then
  echo "nothing to publish"
  exit 0
fi
git commit -m "Publish Stillwater Civic Briefing"
git push origin main
echo "pushed. GitHub Actions deploys the paper."
