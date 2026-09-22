#!/usr/bin/env python3
"""Rebuild feed.xml from podcast.json + episodes/*.json.

Adapted from valor-mn/scripts/build_feed.py. Accepts the older episode files
(file path includes episodes/, duration_seconds) and the current files
(file is a basename, duration is seconds). Skips proof clips and any episode
whose audio is not in the repo yet, so a cloud script commit can deploy the
paper before the audio step finishes.
"""
from __future__ import annotations

import json
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ITUNES = "http://www.itunes.com/dtds/podcast-1.0.dtd"
ATOM = "http://www.w3.org/2005/Atom"
CONTENT = "http://purl.org/rss/1.0/modules/content/"
DISCLAIMER = (
    "Researched and written by AI from public records. Not a substitute for "
    "the official record. Charges are allegations, not convictions. Verify "
    "against the source links."
)


def rfc2822(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return format_datetime(dt)


def duration_str(seconds: int) -> str:
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def main() -> None:
    cfg = json.loads((ROOT / "podcast.json").read_text())
    base = cfg["base_url"].rstrip("/")
    audio_base = cfg.get("audio_base_url", base).rstrip("/")
    link = cfg.get("link", base + "/")
    cover_url = f"{base}/{cfg['cover']}"
    description = cfg["description"]
    if DISCLAIMER not in description:
        description = description.rstrip() + " " + DISCLAIMER

    episodes = []
    for path in sorted((ROOT / "episodes").glob("*.json"), reverse=True):
        ep = json.loads(path.read_text())
        if ep.get("proof"):
            print(f"skip proof {path.name}")
            continue
        file_name = Path(ep["file"]).name
        audio = ROOT / "episodes" / file_name
        if not audio.is_file():
            print(f"skip {path.name}: audio not in repo yet")
            continue
        seconds = ep.get("duration", ep.get("duration_seconds"))
        if not seconds:
            print(f"skip {path.name}: duration missing")
            continue
        ep["_bytes"] = audio.stat().st_size
        ep["_audio_url"] = f"{audio_base}/episodes/{file_name}"
        ep["_dt"] = datetime.fromisoformat(ep["date"]).replace(tzinfo=timezone.utc)
        ep["_seconds"] = int(seconds)
        episodes.append(ep)

    ET.register_namespace("itunes", ITUNES)
    ET.register_namespace("atom", ATOM)
    ET.register_namespace("content", CONTENT)

    rss = ET.Element("rss", {"version": "2.0"})
    ch = ET.SubElement(rss, "channel")
    ET.SubElement(ch, "title").text = cfg["title"]
    ET.SubElement(ch, "link").text = link
    ET.SubElement(
        ch,
        f"{{{ATOM}}}link",
        {"href": f"{base}/feed.xml", "rel": "self", "type": "application/rss+xml"},
    )
    ET.SubElement(ch, "language").text = cfg["language"]
    ET.SubElement(ch, "copyright").text = "© " + cfg.get("copyright", cfg["title"])
    ET.SubElement(ch, "description").text = description
    ET.SubElement(ch, "lastBuildDate").text = rfc2822(datetime.now(timezone.utc))
    ET.SubElement(ch, "generator").text = "stillwater-civic-briefing/scripts/build_feed.py"

    ET.SubElement(ch, f"{{{ITUNES}}}author").text = cfg["author"]
    ET.SubElement(ch, f"{{{ITUNES}}}summary").text = description
    ET.SubElement(ch, f"{{{ITUNES}}}type").text = cfg.get("type", "episodic")
    ET.SubElement(ch, f"{{{ITUNES}}}explicit").text = "true" if cfg.get("explicit") else "false"
    ET.SubElement(ch, f"{{{ITUNES}}}image", {"href": cover_url})
    for cat in cfg.get("categories", [{"text": "News"}]):
        el = ET.SubElement(ch, f"{{{ITUNES}}}category", {"text": cat["text"]})
        if cat.get("sub"):
            ET.SubElement(el, f"{{{ITUNES}}}category", {"text": cat["sub"]})
    owner = ET.SubElement(ch, f"{{{ITUNES}}}owner")
    ET.SubElement(owner, f"{{{ITUNES}}}name").text = cfg.get("owner_name", cfg["author"])
    ET.SubElement(owner, f"{{{ITUNES}}}email").text = cfg["email"]

    img = ET.SubElement(ch, "image")
    ET.SubElement(img, "url").text = cover_url
    ET.SubElement(img, "title").text = cfg["title"]
    ET.SubElement(img, "link").text = link

    for ep in episodes:
        item = ET.SubElement(ch, "item")
        summary = ep["summary"].replace("Hosted by Artie Fishel. ", "").replace("Hosted by Artie Fishel.", "")
        ET.SubElement(item, "title").text = ep["title"]
        ET.SubElement(item, "description").text = summary
        ET.SubElement(item, f"{{{ITUNES}}}summary").text = summary
        ET.SubElement(item, f"{{{CONTENT}}}encoded").text = summary
        ET.SubElement(item, "pubDate").text = rfc2822(ep["_dt"])
        ET.SubElement(item, "link").text = link
        ET.SubElement(item, f"{{{ITUNES}}}image", {"href": cover_url})
        ET.SubElement(
            item,
            "enclosure",
            {"url": ep["_audio_url"], "length": str(ep["_bytes"]), "type": "audio/x-m4a"},
        )
        guid = ET.SubElement(item, "guid", {"isPermaLink": "false"})
        guid.text = ep["guid"]
        ET.SubElement(item, f"{{{ITUNES}}}duration").text = duration_str(ep["_seconds"])
        ET.SubElement(item, f"{{{ITUNES}}}explicit").text = "true" if ep.get("explicit") else "false"
        ET.SubElement(item, f"{{{ITUNES}}}episodeType").text = "full"

    tree = ET.ElementTree(rss)
    ET.indent(tree, space="  ")
    payload = ET.tostring(rss, encoding="unicode").replace("©", "&#xA9;")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + payload + "\n"
    out = ROOT / "feed.xml"
    out.write_text(xml, encoding="utf-8")
    print(f"wrote {out} ({len(episodes)} episode(s))")


if __name__ == "__main__":
    main()
