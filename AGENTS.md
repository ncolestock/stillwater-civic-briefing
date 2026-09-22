# Agents

You are editing the Stillwater Civic Briefing. The paper runs in the cloud. Do not tell Nathan to open the laptop for a routine publish.

## Locks

- The name is Stillwater Civic Briefing. No named host. Do not use Artie Fishel. No first person.
- Articles are markdown in `src/content/articles/`. Commit them to `main`. GitHub Actions deploys the site.
- Do not invent dollars, votes, quotes, parcel IDs, or charges. If a figure is not in the document, say it is not in the document.
- Every article needs at least one primary-source URL in frontmatter.
- Say booked, charged, or alleged. Do not say guilty.
- Do not publish juveniles, victims of sex crimes, confidential informants, medical or mental-health data, mugshots, dates of birth, or home addresses of private persons. A city hall or meeting room address may be published.
- Do not scrape Stillwater Gazette, Pioneer Press, Hudson Star-Observer, or St. Croix 360 body copy. Link out only.
- Do not scrape RecordEASE document images. Cite the public index or a council packet.
- Do not guess BoardBook or CivicPlus IDs. Open the page.
- If a desk has nothing new, omit it. Do not invent a placeholder story.
- No API keys in the repo or in a committed prompt.
- Do not delete `episodes/*.m4a`.

## Article

`src/content/articles/YYYY-MM-DD-slug.md`

```yaml
---
title: "..."
date: 2026-09-21
desk: meetings   # meetings | schools | blotter | land | roads | calendar
city: Lake Elmo
bodies: ["Lake Elmo City Council"]
sources:
  - url: https://example.gov/packet.pdf
    label: "City Council agenda, Sept. 1, 2026"
dollars: null
votes: null
status: draft       # draft until fact-check sets published; held if a claim failed
ai_generated: true
briefing: research/YYYY-MM-DD-slug.md
checked: 2026-09-22   # set by fact-check on a pass
---
```

The site builds pages only for `status: published`. A draft or a held story has no URL.

Body: one event, written so the first two sentences carry the body, the city, and the number. End with "How to follow it" and this line:

The AI disclaimer stays in the site footer. Do not paste it into the story.

Same event, one article. Update the file. Do not fork a second slug. A correction is a dated line in the body, not a silent rewrite.

A booking is one person and one file, desk `blotter`, with `charge` set to a short phrase. The date is the booking date. The blotter page keeps every one. Do not file a grouped roster. Read `STANDARDS.md` before writing.

## Cloud

Three morning jobs, in `automations/`, commit with the GitHub connector (`push_files` or `create_or_update_file` on `main`). They do not run `scripts/publish.sh`.

- `01-research.md` writes `research/`. It does not write articles.
- `02-writer.md` writes drafts from those briefings. It does not publish.
- `03-factcheck.md` re-fetches every source. It is the only job that sets `published`.

Do not collapse these into one prompt. A story that skips fact-check does not go out.

Monday audio is the week's events. Wednesday audio is one officeholder. Commit `episodes/YYYY-MM-DD.json` with a `script` field and a distinct `file`. Leave `duration` at 0 until the Action fills it. The Action calls `https://api.x.ai/v1/tts` with `podcast.json` `tts_voice_id`. Do not put the API key in the file.

## Voice

Plain, specific, local. Facts only. "The council is scheduled to vote" when it has not voted. "The council voted 5–0" only when the minutes say so. Do not praise or condemn.
