# Stillwater Civic Briefing

A hyper-local newspaper and one weekly audio episode. The name stays. There is no named host.

This is a static paper, not an app-factory Next.js app. Astro builds markdown into HTML. GitHub Actions publishes GitHub Pages on every push to `main`. The feed stays at `https://ncolestock.github.io/stillwater-civic-briefing/feed.xml`.

## Laptop closed

The Mac is not in the path.

1. A Grok Automation at grok.com wakes on a schedule, reads public records, and commits markdown to this repo with the GitHub connector.
2. GitHub Actions runs `astro build`, copies `feed.xml`, `cover.jpg`, and `episodes/*.m4a` into the site, and deploys Pages.
3. The Sunday automation commits an episode script. The same Action calls the xAI Text to Speech API (`podcast.json` field `tts_voice_id`, default `eve`) when the repository secret `XAI_API_KEY` is set, writes the m4a, and deploys it. No Mac speech synthesis.

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

An X account that posts a headline, the city, and the article link. The prompt is `automations/04-x-post.md`. Leave it off until the account exists. The morning email already includes a one-line draft so the post is ready.
