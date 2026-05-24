import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			tags: z.array(z.string()).default([]),
			topics: z.array(z.string()).default([]),
			series: z.object({
				slug: z.string(),
				order: z.number().int().positive(),
			}).optional(),
			featured: z.boolean().default(false),
			canonicalURL: z.url().optional(),
			draft: z.boolean().default(false),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		status: z.enum(['active', 'planned', 'idle', 'done']),
		stack: z.array(z.string()).default([]),
		order: z.number().int().positive().default(999),
		repoUrl: z.url().or(z.literal('')).default(''),
		demoUrl: z.url().or(z.literal('')).default(''),
		topics: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		topics: z.array(z.string()).default([]),
		series: z.object({
			slug: z.string(),
			order: z.number().int().positive(),
		}).optional(),
		featured: z.boolean().default(false),
		canonicalURL: z.url().optional(),
		draft: z.boolean().default(false),
	}),
});

const topics = defineCollection({
	loader: glob({ base: './src/content/topics', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number().int().positive().default(999),
		featured: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

const series = defineCollection({
	loader: glob({ base: './src/content/series', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number().int().positive().default(999),
		featured: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, projects, notes, topics, series };
