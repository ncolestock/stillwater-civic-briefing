import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { articleSchema } from "./lib/article-schema.mjs";

// The schema lives in src/lib/article-schema.mjs so the pre-build check in
// scripts/check_articles_schema.mjs uses exactly the same rules.
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: articleSchema,
});

export const collections = { articles };
