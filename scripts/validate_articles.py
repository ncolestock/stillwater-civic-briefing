#!/usr/bin/env python3
"""Check article frontmatter and house rules before a commit. No network. No invented facts.

  python3 scripts/validate_articles.py               report; exit 1 on any error
  python3 scripts/validate_articles.py --quarantine  move each failing piece to quarantine/
                                                     as status: held, log it, exit 0, so one
                                                     bad file cannot freeze the deploy

Schema and type checks (dollars, votes, upcoming fields) live in
scripts/check_articles_schema.mjs, which uses the same schema Astro builds with.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "src" / "content" / "articles"
QUARANTINE = ROOT / "quarantine"
DISCLAIMER = "Researched and written by AI from public records."
REQUIRED = ("title:", "date:", "desk:", "city:", "bodies:", "sources:", "status:", "ai_generated:")
DESKS = {"meetings", "schools", "blotter", "land", "roads", "calendar"}
ADDRESS = re.compile(
    r"\b\d{2,6}\s+[A-Z][A-Za-z0-9.'-]+(?:\s+[A-Z][A-Za-z0-9.'-]+){0,3}\s+"
    r"(?:Ave|Avenue|St|Street|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Trl|Trail|Way|Ct|Court)\b",
    re.I,
)


def quarantine(names: set[str], errors: list[str]) -> None:
    QUARANTINE.mkdir(exist_ok=True)
    for name in sorted(names):
        src = ARTICLES / name
        text = src.read_text()
        if re.search(r"^status:.*$", text, re.M):
            text = re.sub(r"^status:.*$", "status: held", text, count=1, flags=re.M)
        (QUARANTINE / name).write_text(text)
        src.unlink()
        why = "; ".join(e.split(": ", 1)[1] for e in errors if e.startswith(name + ": "))
        print(f"house-rules: QUARANTINED {name}: {why}. Moved to quarantine/ as status held so the rest of the paper deploys.")
        print(f"::error file=src/content/articles/{name}::house-rules: {why}")


def main() -> int:
    errors: list[str] = []
    files = sorted(ARTICLES.glob("*.md"))
    if not files:
        errors.append("no articles")
    for path in files:
        text = path.read_text()
        if not text.startswith("---"):
            errors.append(f"{path.name}: missing frontmatter")
            continue
        try:
            _, fm, body = text.split("---", 2)
        except ValueError:
            errors.append(f"{path.name}: frontmatter did not close")
            continue
        for key in REQUIRED:
            if key not in fm:
                errors.append(f"{path.name}: missing {key}")
        if "ai_generated: true" not in fm:
            errors.append(f"{path.name}: ai_generated must be true")
        if not any(flag in fm for flag in ("status: published", "status: draft", "status: held")):
            errors.append(f"{path.name}: status must be published, draft, or held")
        desk = None
        for line in fm.splitlines():
            if line.startswith("desk:"):
                desk = line.split(":", 1)[1].strip()
        if desk not in DESKS:
            errors.append(f"{path.name}: desk {desk!r} is not a v1 desk")
        if "url:" not in fm:
            errors.append(f"{path.name}: needs at least one source url")
        if DISCLAIMER in body:
            errors.append(f"{path.name}: disclaimer belongs in the site footer, not the story")
        if re.search(r"Artie Fishel|\bhost\b", body, re.I) and "no named host" not in body.lower():
            if "Artie" in body or re.search(r"\bI\b|\bmy\b|\bwe\b", body):
                errors.append(f"{path.name}: named host or first person")
        if "Artie Fishel" in body or "Artie Fishel" in fm:
            errors.append(f"{path.name}: named host")
        held = "status: held" in fm
        if desk == "blotter" and not held:
            if ADDRESS.search(body):
                errors.append(f"{path.name}: blotter body looks like it includes a street address")
            if re.search(r"mugshot|date of birth|\bDOB\b", body, re.I):
                errors.append(f"{path.name}: blotter includes a forbidden field")
            if re.search(r"\bguilty\b", body, re.I):
                errors.append(f"{path.name}: do not call anyone guilty")
            if re.search(r"In plain words", body, re.I):
                errors.append(f"{path.name}: drop the 'In plain words' refrain; accuse in ordinary English")
            if "accused of" not in body.lower():
                errors.append(f"{path.name}: blotter should say accused of the charge")
        if re.search(r"How to follow it", body, re.I):
            errors.append(f"{path.name}: no How to follow it heading; put time, place, and how to speak in the body")
    if errors and "--quarantine" in sys.argv:
        names = {e.split(": ", 1)[0] for e in errors if e.split(": ", 1)[0].endswith(".md")}
        other = [e for e in errors if e.split(": ", 1)[0] not in names]
        quarantine(names, errors)
        if other:
            print("\n".join(other), file=sys.stderr)
            return 1
        print(f"house-rules: {len(files)} file(s) read, {len(names)} quarantined")
        return 0
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"ok {len(files)} article(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
