import {defineField, defineType} from 'sanity';

export const topic = defineType({
	name: 'topic',
	title: '专题',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: '标题',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {source: 'title', maxLength: 96},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: '描述',
			type: 'text',
			rows: 3,
			validation: (Rule) => Rule.required().max(220),
		}),
		defineField({
			name: 'order',
			title: '排序',
			type: 'number',
			initialValue: 999,
			validation: (Rule) => Rule.integer().positive(),
		}),
		defineField({
			name: 'featured',
			title: '首页精选',
			type: 'boolean',
			initialValue: false,
		}),
	],
	preview: {
		select: {title: 'title', subtitle: 'slug.current'},
	},
});
