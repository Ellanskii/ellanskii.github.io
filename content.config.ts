import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    resume: defineCollection({
      type: 'page',
      source: '{,en/}resume.md',
    }),
    articles: defineCollection({
      type: 'page',
      source: [{ include: 'articles/*.md' }, { include: 'en/articles/*.md' }],
      schema: z.object({
        date: z.string(),
        description: z.string().optional(),
      }),
    }),
  },
})
