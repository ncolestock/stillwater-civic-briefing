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
    status: z.enum(["published", "draft", "held"]),
    ai_generated: z.literal(true),
    briefing: z.string().optional(),
    checked: z.string().optional(),
    charge: z.string().optional(),
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
    places: z
      .array(
        z.object({
          label: z.string(),
          lat: z.number(),
          lng: z.number(),
          precise: z.boolean().optional(),
          note: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = { articles };
