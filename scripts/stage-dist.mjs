import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
fs.mkdirSync(path.join(dist, "episodes"), { recursive: true });

function copy(from, to) {
  if (!fs.existsSync(from)) return;
  fs.copyFileSync(from, to);
}

copy(path.join(root, "feed.xml"), path.join(dist, "feed.xml"));
copy(path.join(root, "cover.jpg"), path.join(dist, "cover.jpg"));

const episodes = path.join(root, "episodes");
for (const name of fs.readdirSync(episodes)) {
  if (!name.endsWith(".m4a")) continue;
  copy(path.join(episodes, name), path.join(dist, "episodes", name));
}
console.log("staged feed, cover, and episode audio into dist/");
