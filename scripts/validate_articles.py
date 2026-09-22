#!/usr/bin/env python3
"""Check article frontmatter before a commit. No network. No invented facts."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "src" / "content" / "articles"
DISCLAIMER = "Researched and written by AI from public records."
REQUIRED = ("title:", "date:", "desk:", "city:", "bodies:", "sources:", "status:", "ai_generated:")
DESKS = {"meetings", "schools", "blotter", "land", "roads", "calendar"}
ADDRESS = re.compile(
    r"\b\d{2,6}\s+[A-Z][A-Za-z0-9.'-]+(?:\s+[A-Z][A-Za-z0-9.'-]+){0,3}\s+"
    r"(?:Ave|Avenue|St|Street|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Trl|Trail|Way|Ct|Court)\b",
    re.I,
)


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
        if "status: published" not in fm and "status: draft" not in fm:
            errors.append(f"{path.name}: status must be published or draft")
        desk = None
        for line in fm.splitlines():
            if line.startswith("desk:"):
                desk = line.split(":", 1)[1].strip()
        if desk not in DESKS:
            errors.append(f"{path.name}: desk {desk!r} is not a v1 desk")
        if "url:" not in fm:
            errors.append(f"{path.name}: needs at least one source url")
        if DISCLAIMER not in body:
            errors.append(f"{path.name}: body is missing the AI disclaimer")
        if re.search(r"Artie Fishel|\bhost\b", body, re.I) and "no named host" not in body.lower():
            if "Artie" in body or re.search(r"\bI\b|\bmy\b|\bwe\b", body):
                errors.append(f"{path.name}: named host or first person")
        if "Artie Fishel" in body or "Artie Fishel" in fm:
            errors.append(f"{path.name}: named host")
        if desk == "blotter":
            if ADDRESS.search(body):
                errors.append(f"{path.name}: blotter body looks like it includes a street address")
            if re.search(r"mugshot|date of birth|\bDOB\b", body, re.I):
                errors.append(f"{path.name}: blotter includes a forbidden field")
            if re.search(r"\bguilty\b", body, re.I):
                errors.append(f"{path.name}: do not call anyone guilty")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"ok {len(files)} article(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
