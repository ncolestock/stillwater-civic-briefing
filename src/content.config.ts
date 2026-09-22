import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    desk: z.enum(["meetings", "schools", "blotter", "land", "roads", "calendar"]),
    city: z.string(),
    bodies: z.array(z.string()).min(1),
    sources: z
      .array(z.object({ url: z.string().url(), label: z.string() }))
      .min(1),
    dollars: z.string().nullable(),
    votes: z.string().nullable(),
    status: z.enum(["published", "draft"]),
    ai_generated: z.literal(true),
    correction: z.string().optional(),
    upcoming: z
      .array(
        z.object({
          when: z.string(),
          what: z.string(),
          where: z.string(),
          url: z.string().url(),
        }),
      )
      .optional(),
  }),
});

export const collections = { articles };
