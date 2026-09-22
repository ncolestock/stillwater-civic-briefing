import { defineConfig } from "astro/config";

// Project site on GitHub Pages. The feed and audio stay at this origin
// so existing podcast subscriptions keep working.
export default defineConfig({
  site: "https://ncolestock.github.io",
  base: "/stillwater-civic-briefing",
  trailingSlash: "always",
});
