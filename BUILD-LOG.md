# Build log

## 2026-09-21

Repo was publish artifacts only: `index.html`, `podcast.json`, `feed.xml`, `cover.jpg`, `episodes/`. GitHub Pages served the branch root. The old landing page named a host. That page was moved to `public/archive/legacy.html` without the host name. Episode audio was left in place.

Stack is Astro on GitHub Actions, because the paper has to publish while the laptop is closed. Grok Automations commit markdown. Actions build the site and, when `XAI_API_KEY` is set, render weekly audio with `POST https://api.x.ai/v1/tts`.

### Sources probed

| URL | Result |
|---|---|
| https://www.stillwatermn.gov/city-government/meeting-agendas-minutes-and-material | 403 Akamai |
| https://cityofstillwater.granicus.com/ViewPublisher.php?view_id=3 | 200, 330 KB |
| https://www.lakeelmo.gov/AgendaCenter | 403 Cloudflare challenge |
| https://www.oakdalemn.gov/AgendaCenter | 200 |
| https://woodburymn.gov/AgendaCenter | 403 Cloudflare challenge |
| https://www.bayportmn.gov/ | 200. `/AgendaCenter`, `/calendar`, `/government` returned 500 |
| https://www.cityofoakparkheights.com/ | 200. Packet index 200 with no PDF links. `/AgendaCenter` 404 |
| https://www.washingtoncountymn.gov/283/Agendas-and-Minutes | 200 |
| https://www.washingtoncountymn.gov/AgendaCenter | 200 |
| https://www.hudsonwi.gov/AgendaCenter | 200. Search Sept. 14–28, 2026 returned no results |
| https://townofhudsonwi.com/ | 200. `/AgendaCenter` 404 |
| https://www.sccwi.gov/AgendaCenter | 200 |
| https://meetings.boardbook.org/Public/Organization/2592 | 200. Sept. 22 meeting 765266 |
| https://meetings.boardbook.org/Public/Organization/1069 | 200. Latest 2026 meeting Aug. 17 |
| https://www.sowashco.org/ | 200. Links use district833.org. Not added to v1 |
| https://web1.co.washington.mn.us/WCInmateRoster/InmateRosterReport.pdf | 200, 61 KB, printed 8:00 p.m. Sept. 21, no charge column |
| https://www.washingtoncountymn.gov/3220/Daily-Jail-Booking-Report | 200 |
| https://web1.co.washington.mn.us/WCBookings/Monday.pdf | 200, 116 KB, window Sept. 20 7 a.m.–Sept. 21 7 a.m., 14 adults, charges present, addresses present and not published |
| https://web1.co.washington.mn.us/WCBookings/ | 403 |
| https://prweb.co.washington.mn.us/ | 200 login page |
| https://beacon.schneidercorp.com/Application.aspx?AppID=1210 | 403 Cloudflare |
| https://gis.washingtoncountymn.gov/ | DNS failure |
| https://www.washingtoncountymn.gov/397/GIS-and-Maps | 404 |
| https://gisdata.mn.gov/ | 200 |
| https://www.revenue.state.mn.us/eCRV | 404 |
| https://www.revenue.state.mn.us/electronic-certificate-real-estate-value | 404 |
| https://www.hometownsource.com/stillwater_gazette/ | 200 |
| https://www.twincities.com/tag/stillwater/ | 200 |
| https://www.hudsonstarobserver.com/ | 200 |
| https://www.stcroix360.com/ | 200 |

Documents read for the seed stories:

- County agenda `_09222026-1946` and packet `_09222026-1945` (levy resolution $161,986,500; rail $660,000; CDA not to exceed $7,283,446; Valley Paving $359,796.75).
- Oakdale council packet `_09222026-916`, agenda pages.
- BoardBook agenda meeting 765266.
- Granicus AgendaViewer `event_id=1440`.
- Monday book-in PDF. Ages were used only to confirm every row was 21 or older. Ages, addresses, and officers were not copied into the story.

Lake Elmo and Woodbury were not given stories. Their agenda sites returned a challenge page.

## 2026-09-21 later

Split the morning job into three automations. Research writes `research/`. The writer writes drafts. Fact-check is the only step that sets `published`. Article pages are generated only for published stories. Podcast and X read published stories only.

### Not done in this session

- `XAI_API_KEY` is not in the environment. Weekly audio will not render until that secret is on the repo. A Mac voice sample is separate from the feed.
- ISD 833 is confirmed as the South Washington district’s own numbering and is not in the coverage list.
- No X account is connected.

## 2026-09-22

The design notes now match the live masthead: full-width `public/brand/bridge-wide.jpg` under the Cinzel stacked name. The seal stays a favicon and lettermark. The disclaimer stays in the site footer and in the `podcast.json` show description.

The front page leads with one story, then two secondary, then a list. The meetings month and the land map read `upcoming` and `places` on published stories. Roads stays out of the nav until a roads story is published.

`episodes/` has no Monday events file for 2026-09-21 (only `2026-09-21-proof.json`, a voice sample). Wednesday 2026-09-23 was not due yet. This job did not write an episode script.
