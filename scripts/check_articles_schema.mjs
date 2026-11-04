#!/usr/bin/env node
// Pre-build schema check for src/content/articles/*.md.
//
// Uses the SAME schema the Astro build uses (src/lib/article-schema.mjs) and
// the same YAML parser, so a file that passes here will not stop the build.
//
//   node scripts/check_articles_schema.mjs          report only. Exit 1 if any file fails.
//   node scripts/check_articles_schema.mjs --fix    repair or quarantine, then exit 0:
//       1. An unquoted number in `dollars` or `votes` is quoted. Nothing else changes.
//       2. Any other failing file is moved to quarantine/ with status: held, so the
//          rest of the paper still builds and deploys. The file is not deleted.
//
// Every log line starts with "schema-check:" so the deploy alert can find it.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// js-yaml is the parser Astro itself loads front matter with (a dependency of astro), so this reads
// files exactly as the build does.
import yaml from "js-yaml";
import { articleSchema } from "../src/lib/article-schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES = join(ROOT, "src", "content", "articles");
const QUARANTINE = join(ROOT, "quarantine");
const fix = process.argv.includes("--fix");

function split(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  return m ? { fm: m[1], head: m[0] } : null;
}

function problems(text) {
  const parts = split(text);
  if (!parts) return { errors: ["front matter is missing or never closes"], issues: [] };
  let data;
  try {
    data = yaml.load(parts.fm);
  } catch (e) {
    return { errors: [`YAML will not parse: ${String(e.message).split("\n")[0]}`], issues: [] };
  }
  if (!data || typeof data !== "object") return { errors: ["front matter is empty"], issues: [] };
  const res = articleSchema.safeParse(data);
  if (res.success) return { errors: [], issues: [] };
  return {
    errors: res.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    issues: res.error.issues,
  };
}

function quoteNumbers(text, issues) {
  // Only dollars/votes, only when the value is a bare number on its own line.
  let out = text;
  let changed = false;
  for (const i of issues) {
    const key = i.path[0];
    if (i.path.length !== 1 || (key !== "dollars" && key !== "votes")) continue;
    const re = new RegExp(`^(${key}:[ \\t]*)(-?[0-9][0-9.,]*)[ \\t]*$`, "m");
    if (re.test(out)) {
      out = out.replace(re, (_, k, v) => `${k}"${v}"`);
      changed = true;
    }
  }
  return changed ? out : null;
}

let files = [];
try {
  files = readdirSync(ARTICLES).filter((f) => f.endsWith(".md")).sort();
} catch {
  console.log("schema-check: no articles directory");
  process.exit(1);
}

const failed = [];
const repaired = [];
const quarantined = [];

for (const name of files) {
  const path = join(ARTICLES, name);
  let text = readFileSync(path, "utf8");
  let r = problems(text);
  if (r.errors.length === 0) continue;

  if (fix) {
    const fixed = quoteNumbers(text, r.issues);
    if (fixed) {
      const r2 = problems(fixed);
      if (r2.errors.length === 0) {
        writeFileSync(path, fixed);
        repaired.push(name);
        console.log(`schema-check: REPAIRED ${name}: quoted a bare number (${r.errors.join("; ")})`);
        continue;
      }
    }
  }
  failed.push({ name, errors: r.errors, text });
}

for (const f of failed) {
  const status = /^status:[ \t]*(\S+)/m.exec(f.text)?.[1] ?? "unknown";
  console.log(`schema-check: FAIL ${f.name} (status ${status}): ${f.errors.join("; ")}`);
  console.log(`::error file=src/content/articles/${f.name}::schema-check: ${f.errors.join("; ")}`);
  if (fix) {
    mkdirSync(QUARANTINE, { recursive: true });
    const held = /^status:.*$/m.test(f.text)
      ? f.text.replace(/^status:.*$/m, "status: held")
      : f.text;
    writeFileSync(join(QUARANTINE, f.name), held);
    rmSync(join(ARTICLES, f.name));
    quarantined.push(f.name);
    console.log(
      `schema-check: QUARANTINED ${f.name}: moved to quarantine/ as status held so the rest of the paper deploys. Fix it, then move it back to src/content/articles/.`,
    );
  }
}

console.log(
  `schema-check: ${files.length} file(s) read, ${repaired.length} repaired, ${quarantined.length} quarantined, ${fix ? 0 : failed.length} failing`,
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `quarantined=${quarantined.length}\nrepaired=${repaired.length}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `quarantined_list=${quarantined.join(", ")}\n`);
}

process.exit(!fix && failed.length ? 1 : 0);
