#!/usr/bin/env bash
# Run by the "notify" job in .github/workflows/pages.yml after every Deploy paper run.
#
#  - build or deploy failed  -> open (or update) one issue titled "Deploy failing", with the
#                               error lines from the failed job, assigned to the repo owner.
#                               GitHub emails the assignee, so this is the alert.
#  - both jobs succeeded     -> close that issue, with a comment.
#  - pieces were quarantined -> open (or update) a "Pieces quarantined" issue listing them.
#                               It is not closed automatically: a person fixes the files.
#
# Needs: gh, GH_TOKEN, REPO, RUN_ID, RUN_URL, BUILD_RESULT, DEPLOY_RESULT.
# DRY_RUN=1 prints what it would do and changes nothing.
set -uo pipefail

OWNER="${ALERT_ASSIGNEE:-ncolestock}"
FAIL_TITLE="Deploy failing"
QUAR_TITLE="Pieces quarantined"
DRY_RUN="${DRY_RUN:-0}"
NOW="$(TZ=America/Chicago date '+%a %b %-d, %Y %-I:%M %p Central')"
TMP="$(mktemp -d)"

api_jobs() { gh api "repos/$REPO/actions/runs/$RUN_ID/jobs?per_page=100" --paginate; }

find_issue() {
  gh issue list -R "$REPO" --state open --limit 100 --json number,title \
    --jq ".[] | select(.title==\"$1\") | .number" | head -1
}

job_log() { # job id -> log text without timestamps or ANSI colour
  curl -sSL -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/actions/jobs/$1/logs" 2>/dev/null \
    | sed -E 's/^[0-9T:.\-]+Z //; s/\x1b\[[0-9;]*m//g'
}

upsert() { # title, body file, assign (0/1)
  local title="$1" file="$2" assign="$3" n
  if [ "$DRY_RUN" = 1 ]; then echo "=== DRY RUN: issue \"$title\" ==="; cat "$file"; return 0; fi
  n="$(find_issue "$title")"
  if [ -n "$n" ]; then
    gh issue edit "$n" -R "$REPO" --body-file "$file" && echo "Updated issue #$n ($title)"
  else
    if [ "$assign" = 1 ]; then
      gh issue create -R "$REPO" --title "$title" --body-file "$file" --assignee "$OWNER" \
        || gh issue create -R "$REPO" --title "$title" --body-file "$file"
    else
      gh issue create -R "$REPO" --title "$title" --body-file "$file"
    fi
  fi
}

jobs_json="$(api_jobs)"

# ---- failure -------------------------------------------------------------------------------
if [ "$BUILD_RESULT" = failure ] || [ "$DEPLOY_RESULT" = failure ]; then
  : > "$TMP/errors.txt"
  for id in $(echo "$jobs_json" | jq -r '.jobs[] | select(.conclusion=="failure") | .id'); do
    name="$(echo "$jobs_json" | jq -r ".jobs[] | select(.id==$id) | .name")"
    step="$(echo "$jobs_json" | jq -r ".jobs[] | select(.id==$id) | [.steps[] | select(.conclusion==\"failure\")][0].name // \"unknown step\"")"
    {
      echo "Job: $name"
      echo "Failed step: $step"
      job_log "$id" | grep -E -i '(error|invalidcontententry|failed|✖|schema-check: (FAIL|QUARANTINED)|house-rules:|Location:|\.md\b|\bTraceback\b|exit code)' \
        | grep -v -E '^(##\[group\]|##\[endgroup\])' | head -40
      echo
    } >> "$TMP/errors.txt"
  done
  [ -s "$TMP/errors.txt" ] || echo "No error lines could be read from the logs. Open the run." > "$TMP/errors.txt"
  {
    echo "@$OWNER The paper did not deploy. The live site is still on the last good build."
    echo
    echo "- Run: $RUN_URL"
    echo "- Last failure seen: $NOW"
    echo "- Build: $BUILD_RESULT. Deploy: $DEPLOY_RESULT."
    echo
    echo "Error lines from the failed job:"
    echo
    echo '```'
    cat "$TMP/errors.txt"
    echo '```'
    echo
    echo "This issue closes by itself on the next successful deploy. Later failures edit this text and do not send another email."
  } > "$TMP/fail.md"
  upsert "$FAIL_TITLE" "$TMP/fail.md" 1
fi

# ---- success: close the failure issue -------------------------------------------------------
if [ "$BUILD_RESULT" = success ] && [ "$DEPLOY_RESULT" = success ]; then
  n="$(find_issue "$FAIL_TITLE")"
  if [ -n "$n" ]; then
    if [ "$DRY_RUN" = 1 ]; then echo "DRY RUN: would close #$n"; else
      gh issue close "$n" -R "$REPO" --comment "Deploy paper succeeded again ($RUN_URL, $NOW). Closing."
    fi
  fi
fi

# ---- quarantined pieces ---------------------------------------------------------------------
build_id="$(echo "$jobs_json" | jq -r '[.jobs[] | select(.name=="build")][0].id // empty')"
if [ -n "$build_id" ]; then
  job_log "$build_id" | grep -E 'QUARANTINED|REPAIRED' > "$TMP/quar.txt" || true
  if grep -q QUARANTINED "$TMP/quar.txt" 2>/dev/null; then
    {
      echo "@$OWNER These pieces failed a pre-build check and were moved out of src/content/articles/ into quarantine/ as status: held, so the rest of the paper could deploy."
      echo
      echo "- Run: $RUN_URL"
      echo "- Seen: $NOW"
      echo
      echo '```'
      cat "$TMP/quar.txt"
      echo '```'
      echo
      echo "To restore one: fix its front matter, move it back to src/content/articles/, and set status: published once it is fact-checked. Close this issue when done."
    } > "$TMP/quar.md"
    upsert "$QUAR_TITLE" "$TMP/quar.md" 1
  fi
fi
exit 0
