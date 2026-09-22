# Stillwater Civic Briefing

A hyper-local newspaper and one weekly audio episode. The name stays. There is no named host.

This is a static paper, not an app-factory Next.js app. Astro builds markdown into HTML. GitHub Actions publishes GitHub Pages on every push to `main`. The feed stays at `https://ncolestock.github.io/stillwater-civic-briefing/feed.xml`.

## Laptop closed

The Mac is not in the path. Three automations run each morning, in order. None of them is allowed to do the other two jobs.

1. Research, 7:00 a.m., writes `research/YYYY-MM-DD-slug.md`. That file is notes from the packet. It is not on the site.
2. Writer, 8:15 a.m., turns each new briefing into a draft article. Drafts are not built into public pages.
3. Fact-check, 9:30 a.m., re-opens every source URL. It is the only job that may set `status: published`. A story it cannot source stays `held`.

GitHub Actions then runs `astro build` and deploys Pages. Sunday at 4:00 p.m. a fourth automation writes the episode script from published stories only. The Action calls the xAI Text to Speech API (`podcast.json` field `tts_voice_id`, default `eve`) when the repository secret `XAI_API_KEY` is set.

`scripts/publish.sh` and `scripts/tts.sh` are the fallback for a draft that landed on the Mac. They are not how the paper runs day to day.

If the GitHub connector cannot write, the automation puts the markdown in a Google Drive folder named `SCB-drafts` and emails the paths. That is the only step that needs a person, and only when GitHub write is unavailable.

## What ships

- Articles: `src/content/articles/YYYY-MM-DD-slug.md`
- Desks: Meetings, Schools, Land, Blotter, Calendar. Roads only when a packet is a road story.
- Geography: Stillwater, Lake Elmo, Oakdale, Woodbury, Bayport, Oak Park Heights, Washington County, Hudson, the Town of Hudson, St. Croix County, Stillwater Area Public Schools, North St. Paul–Maplewood–Oakdale schools.
- South Washington County Schools uses `district833.org` on its own site. It is not in v1 until Nathan adds it.
- Blotter: adult name, charge as written, booking date, source. Nothing else.
- Every page, article, and the podcast feed carries the AI disclaimer in `src/lib/site.ts`.

## Later

An X account that posts a headline, the city, and the article link, and only after fact-check has published the story. The prompt is `automations/05-x-post.md`. Leave it off until the account exists.
