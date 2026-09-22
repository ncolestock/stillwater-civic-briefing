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
status: published
ai_generated: true
---
```

Body: 150–400 words, one event. Lede with the decision or the record. End with "How to follow it" and this line:

> Researched and written by AI from public records. Not a substitute for the official record. Charges are allegations, not convictions. Verify against the source links.

Same event, one article. Update the file. Do not fork a second slug. A correction is a dated line in the body, not a silent rewrite.

Blotter items may be a dated roster brief. One source URL must cover each person. Publish only bookings that are not already in `src/content/articles/`. Dedup on name + booking date + charge. The daily PDF is replaced each week, so write the printed start time, end time, and print time into the story.

## Cloud

Morning and afternoon automations live in `automations/`. They commit with the GitHub connector (`push_files` or `create_or_update_file` on `main`). They do not run `scripts/publish.sh`.

Weekly audio: commit `episodes/YYYY-MM-DD.json` with a `script` field and `"file": "YYYY-MM-DD.m4a"`. Leave `duration` at 0 until the Action fills it. The Action calls `https://api.x.ai/v1/tts` with `podcast.json` `tts_voice_id`. Do not put the API key in the file.

## Voice

Plain, specific, local. "The council is scheduled to vote" when it has not voted. "The council voted 5–0" only when the minutes say so.
