# New Saint Croix Union

A hyper-local newspaper and two audio episodes a week. Monday is the public events. Wednesday is one person who holds office, from the public record, and it does not air when that record is too thin to say how they got the job and what they have done. The official name is New Saint Croix Union. In body copy the short name may be NSCU or the Union. There is no named host.

This is a static paper, not an app-factory Next.js app. Astro builds markdown into HTML. GitHub Actions publishes GitHub Pages on every push to `main`. The feed stays at `https://ncolestock.github.io/stillwater-civic-briefing/feed.xml`.

## Laptop closed

The Mac is not in the path. Three automations run each morning, in order. None of them is allowed to do the other two jobs. Canonical prompts live in `automations/*.md` plus `STANDARDS.md`. Grok Automations on grok.com are thin wrappers only — see `automations/GROK-WRAPPERS.md`.

1. Research, 7:00 a.m., writes `research/YYYY-MM-DD-slug.md`. That file is notes from the packet. It is not on the site.
2. Writer, 8:15 a.m., turns each new briefing into a draft article. Drafts are not built into public pages.
3. Fact-check, 9:30 a.m., re-opens every source URL. It is the only job that may set `status: published`. A story it cannot source stays `held`.

GitHub Actions then runs `astro build` and deploys Pages. Monday at 4:00 p.m. an automation writes the events episode from published stories. Wednesday at 4:00 p.m. another writes one person, under the profile test in `STANDARDS.md`, and commits nothing when the test fails. The Action calls the xAI Text to Speech API (`podcast.json` field `tts_voice_id`, default `eve`) when the repository secret `XAI_API_KEY` is set.

`scripts/publish.sh` and `scripts/tts.sh` are the fallback for a draft that landed on the Mac. They are not how the paper runs day to day.

If the GitHub connector cannot write, the automation puts the markdown in a Google Drive folder named `SCB-drafts` and emails the paths. That is the only step that needs a person, and only when GitHub write is unavailable.

## What ships

- Articles: `src/content/articles/YYYY-MM-DD-slug.md`
- Home is the paper: main story list, Events on the side (header opens the calendar), Arrests under Events (header opens the blotter). Desk index pages still exist for deep links; they are not a header menu.
- Masthead: engraved lockup — small caps NEW SAINT CROIX over a large UNION, fleur rule, lift-bridge engraving (`public/brand/bridge-engraving.png`), and Reborn. 2026. Title remaining New Saint Croix Union. Cream parchment field. Edition date under the lockup. RSS in the header; podcast in the footer. The seal is a favicon and a lettermark. The GitHub repo and the Pages path stay `stillwater-civic-briefing`.
- Geography: Stillwater, Lake Elmo, Oakdale, Woodbury, Bayport, Oak Park Heights, Washington County, Hudson, the Town of Hudson, St. Croix County, Stillwater Area Public Schools, North St. Paul–Maplewood–Oakdale schools.
- South Washington County Schools uses `district833.org` on its own site. It is not in v1 until Nathan adds it.
- Stories put the meeting time, the place, and how to speak in the body. They do not end with a "How to follow it" section.
- Calendar stories say what the event is and what is there so a reader can decide whether to go.
- Blotter: adult name, booking date, agency, "accused of" the charge in ordinary English, statute once, source. Two to four sentences. Never guilty. A booking is not a conviction. No "In plain words" refrain. No "How to follow it."
- The AI disclaimer is the site footer (`src/lib/site.ts`) and, once, the podcast show description in `podcast.json`. It is not inside an article, a booking, or an episode's show notes.

## Later

An X account that posts a headline, the city, and the article link, and only after fact-check has published the story. The prompt is `automations/06-x-post.md`. Leave it off until the account exists.
