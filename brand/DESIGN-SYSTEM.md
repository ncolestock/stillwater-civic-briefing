# New Saint Croix Union — Design System

Source of truth for the newspaper website and the weekly TTS podcast.
Grok Build: treat this folder as brand law. Do not invent a new look.

## Locked identity

| Item | Value |
|---|---|
| Name | **New Saint Croix Union** |
| Short | NSCU, or the Union |
| Tagline | St. Croix Valley public record |
| Podcast line | A weekly account of the valley |
| Host | **None.** No person, no persona, no byline name. Institutional masthead only. |
| Voice | Public-record clerk, not a morning-show host. |
| Tone of the mark | 1931 letterpress / engraved lift bridge / broadsheet flag |

Do not revive "Artie Fishel." Do not add "The" to the official name except on the classic banner lockup (`nameplate-classic-banner.jpg`), where it is ornamental.

## Geography line (dateline)

Stillwater · Lake Elmo · Oakdale · Woodbury · Hudson · Bayport · Oak Park Heights

Oak Park Heights may wrap on small screens. Washington County / St. Croix County belong in body copy and section labels, not in the flag.

## Color

| Token | Hex | Use |
|---|---|---|
| Ink | `#1A1612` | Type, rules, engraved bridge |
| Ink soft | `#3A342C` | Secondary type, captions |
| Cream | `#F2EAD8` | Page field. Sampled from the sky of `public/brand/bridge-wide.jpg`. Warm `#F0E4D8` family. |
| Cream dark | `#E6D9C6` | Alternate rows, rails, calendar heads |
| Rule | `#C4B8A4` | Hairline rules between items |
| Oxblood | `#7A1F2B` | Accent rules, links, stars, section kickers |
| Oxblood hover | `#5E1721` | Link hover |
| Bridge green | `#4A5A3A` | Optional historic-paint accent **only**. Never a background. |
| Water | `#6A7A82` | Rare illustration tint |

No bright green (`#0b5` from the old landing page). No neon. No dark-mode inversion in v1 — cream paper is the brand.

## Type

Load from Google Fonts (wired in `src/layouts/Base.astro`):

- **Nameplate (live masthead):** Cinzel, two lines — New Saint Croix / Union — small, with open tracking and a short oxblood rule between the lines. The bridge underneath is the hero. The nameplate must not dominate. Do not set body copy in Cinzel.
- **Display fallback:** Old Standard TT. Headlines may use it. It is not the nameplate.
- **Body:** Source Serif 4, 18px / 1.55, measure ~38rem.
- **UI, nav, dateline, blotter labels:** Source Sans 3, small caps or tracked uppercase.
- Do **not** use blackletter (Unifraktur, Fraktur, Old English) as a primary face.

Print feel: open tracking on the flag (`0.28em`–`0.46em`). The type stays small. A giant flag looks like a billboard.

## The mark: Stillwater Lift Bridge

The picture is the **1931 Waddell & Harrington vertical-lift** on the St. Croix (MnDOT Bridge 4654), not a generic truss and not a suspension span.

Must be readable in the drawing:

1. **Two tall steel lattice towers** at either end of the movable span (spans 3 and 5; towers ~82 ft).
2. **Paired sheaves (wheels) on top of each tower** — the real sheaves are about 9 ft across. Draw them as wheels, not dots, not lanterns.
3. **Counterweight boxes traveling inside the tower lattice.**
4. **140-ft Parker through-truss lift span** between the two towers. The lift span itself is a truss, not a flat deck.
5. **Parker through-truss approach spans** on both sides, on stone/concrete river piers.
6. **River + low bluffs.** No skyline, no cars, no people, no St. Croix Crossing cable-stays.

Reject any rendering that looks like:

- a suspension or cable-stayed bridge (the new St. Croix Crossing is a different bridge)
- a single-tower lift
- a flat deck with decorative posts
- a covered bridge
- a skyline badge

Canonical engraved references in this packet:

- `assets/seal-civic.jpg` — primary seal
- `assets/seal-civic-alt.jpg` — alternate seal, even clearer sheaves
- `assets/nameplate-wide.jpg` — full elevation under the flag
- `svg/seal.svg` — resolution-independent stand-in

## Lockups (what to use where)

| File | Role | Where it goes in the repo |
|---|---|---|
| `public/brand/bridge-wide.jpg` | **Live home masthead.** Full-width engraved lift under the Cinzel name. | Do not replace it with the seal. Do not shrink it to a tiny mark. |
| `assets/podcast-cover-weekly-briefing.jpg` | **Primary podcast cover** | `cover.jpg` at repo root (overwrite the existing file). Also `public/brand/podcast-cover.jpg`. Apple/Spotify 3000×3000 after upscale. |
| `assets/podcast-cover-woodtype.jpg` | Alternate podcast / social square | `public/brand/podcast-lockup.jpg` |
| `assets/seal-civic.jpg` | Favicon, lettermark, podcast adjunct. Not the home masthead. | `public/brand/seal.jpg` |
| `assets/nameplate-wide.jpg` | Source art for the wide bridge engraving | The shipped masthead file is `public/brand/bridge-wide.jpg` |
| `assets/wordmark-flag.jpg` | Simple typographic flag | header text can replace this; keep as fallback |
| `assets/lettermark-scb.jpg` | App icon / social avatar | `public/brand/lettermark.jpg` |
| `assets/nameplate-classic-banner.jpg` | Optional "The …" banner | interior pages, about, colophon |
| `svg/*.svg` | Sharp UI, favicon, print | `public/brand/` and `src/icons/` |

**Podcast cover decision:** use `podcast-cover-weekly-briefing.jpg` as `cover.jpg`. It is old-timey, square, has the accurate lift, and reads at 200 px in a podcast app. The wood-type stacked lockup is the second choice if you want the words larger than the picture.

**Home masthead decision:** the live flag is Cinzel, two lines, New Saint Croix / Union, kept small. `public/brand/bridge-wide.jpg` runs full width underneath and is the hero. Old Standard TT may remain as the headline and body fallback. The seal is the favicon, the lettermark, and a podcast adjunct. It does not sit in the masthead.

## Website newspaper look

The site should feel like a small-city broadsheet, not a blog and not a dashboard.

- Cream page `#F2EAD8`, black ink, oxblood hairlines. A faint grain and a faint contour sit in the page background. The bridge image stays clean.
- Centered masthead: a small Cinzel flag, New Saint Croix / Union, then the engraved Stillwater Lift Bridge at full width (`public/brand/bridge-wide.jpg`). Do not swap in the seal. Do not shrink the bridge to a tiny mark. Then a tracked dateline of towns, a double rule, and section nav (Meetings · Schools · Land · Blotter · Calendar · Podcast). Roads joins that nav only when a roads story is published.
- Home is a front page: one lede, then one continuous list of the other stories. No "Also filed." The rail is events, then blotter.
- Body in a readable serif. Headlines stay modest. Decks and kickers in sans small caps. Spacing is tight, like an almanac column, not a poster.
- No hero video. No card drop shadows. No rounded-everything UI kit.
- Photographs: none required in v1. If you add a photo later, it is a public-domain or city-packet figure, credited, never a mugshot.

Starter stylesheet: `css/newspaper.css`.

## Podcast / RSS artwork

Apple Podcasts / Spotify / YouTube Music want a **square** image, 1400–3000 px, JPEG or PNG, no essential type in the outer 8% if you can help it (we still put WEEKLY BRIEFING low-center; it is the show name).

In `podcast.json` and `feed.xml`:

- `<itunes:image href="…/cover.jpg"/>`
- Title: New Saint Croix Union
- Author / owner: New Saint Croix Union (not a person)
- Category: News / Local
- The show description in `podcast.json` includes the AI disclaimer once. Do not repeat it on each episode.

Upscale the provided JPG to 3000×3000 with a cream letterbox if needed. Do not add a microphone cartoon, play button, or "host" headshot.

## Disclaimer

> Researched and written by AI from public records. Not a substitute for the official record. Charges are allegations, not convictions. Verify against the source links.

Two places only:

- the site footer (`src/lib/site.ts`, rendered by `Base.astro`)
- the podcast show description in `podcast.json`, once, so a subscriber who never opens the site still sees it

Do not put it at the end of an article, in a booking, or in an episode's show notes. `scripts/validate_articles.py` rejects that sentence in a story body. The feed's channel description is the show description; do not add a second copy on `<copyright>` or on each item.

## Do / don't

**Do**

- Keep cream / ink / oxblood.
- Draw the real lift bridge.
- Use tracked small caps for desks and datelines.
- Put source links in the story, not only in a footer.
- Keep the column tight. The bridge gets the room. The type does not shout.

**Don't**

- Name a host.
- Use the old `#0b5` link color.
- Use Inter / system-ui as the display face.
- Put a waveform, mic, or earbuds icon in the logo.
- Crop the sheaves off the towers.
- Add Wisconsin or Minnesota flags, eagles, or clip-art gavel.
- Dark-mode the paper in v1.

## Implementation notes for Grok Build

1. Copy this whole `scb-design-packet` into the repo as `brand/` (or `docs/brand/` plus `public/brand/` for binaries).
2. Replace root `cover.jpg` with an upscaled `podcast-cover-weekly-briefing.jpg`.
3. Point `podcast.json` `image` at `cover.jpg`. Strip any host name.
4. Tokens live in `src/styles/tokens.css` (the only `:root`). Component rules live in `src/styles/global.css`. The layout is `src/layouts/Base.astro`.
5. Favicon: `svg/favicon.svg` + a 180px apple-touch cropped from the seal.
6. Open Graph default image: crop `nameplate-wide.jpg` to 1200×630, cream field, name + bridge.
7. Do not commit "Artie Fishel" in new files.

See `grok-build/DESIGN_BRIEF.md` for a paste-ready block.
