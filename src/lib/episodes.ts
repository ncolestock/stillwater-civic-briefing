import fs from "node:fs";
import path from "node:path";

export interface Episode {
  date: string;
  title: string;
  summary: string;
  guid: string;
  file: string;
  duration: number;
  explicit?: boolean;
  proof?: boolean;
  script?: string;
  type?: string;
}

const ROOT = process.cwd();

export function loadEpisodes(): Episode[] {
  const dir = path.join(ROOT, "episodes");
  if (!fs.existsSync(dir)) return [];
  const episodes: Episode[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    const raw = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as Episode & {
      duration_seconds?: number;
    };
    const fileName = path.basename(raw.file ?? name.replace(/\.json$/, ".m4a"));
    episodes.push({
      ...raw,
      file: fileName,
      duration: Number(raw.duration ?? raw.duration_seconds ?? 0),
    });
  }
  return episodes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function publicSummary(summary: string): string {
  return summary
    .replace(/Hosted by Artie Fishel\.?\s*/g, "")
    .replace(/Artie Fishel/g, "")
    .trim();
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
