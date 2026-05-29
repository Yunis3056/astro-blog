import {defineArrayMember, defineField, defineType} from 'sanity';

export const project = defineType({
	name: 'project',
	title: '项目',
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
			title: '摘要',
			type: 'text',
			rows: 3,
			validation: (Rule) => Rule.required().max(220),
		}),
		defineField({
			name: 'status',
			title: '状态',
			type: 'string',
			options: {
				list: [
					{title: '进行中', value: 'active'},
					{title: '规划中', value: 'planned'},
					{title: '待启动', value: 'idle'},
					{title: '已完成', value: 'done'},
				],
				layout: 'radio',
			},
			initialValue: 'active',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'stack',
			title: '技术栈',
			type: 'array',
			of: [defineArrayMember({type: 'string'})],
			options: {layout: 'tags'},
			initialValue: [],
		}),
		defineField({
			name: 'order',
			title: '排序',
			type: 'number',
			initialValue: 999,
			validation: (Rule) => Rule.integer().positive(),
		}),
		defineField({
			name: 'repoUrl',
			title: '仓库 URL',
			type: 'url',
		}),
		defineField({
			name: 'demoUrl',
			title: '演示 URL',
			type: 'url',
		}),
		defineField({
			name: 'topics',
			title: '专题',
			type: 'array',
			of: [defineArrayMember({type: 'reference', to: [{type: 'topic'}]})],
			initialValue: [],
		}),
		defineField({
			name: 'featured',
			title: '首页精选',
			type: 'boolean',
			initialValue: false,
		}),
		defineField({
			name: 'body',
			title: '正文',
			type: 'portableText',
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {title: 'title', subtitle: 'status'},
	},
});
