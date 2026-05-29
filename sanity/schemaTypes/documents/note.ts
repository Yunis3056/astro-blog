import {defineArrayMember, defineField, defineType} from 'sanity';

const apiVersion = '2025-02-19';

async function uniqueSeriesOrder(value: {series?: {_ref?: string}; order?: number} | undefined, context: any) {
	if (!value?.series?._ref || !value.order) return true;

	const documentId = String(context.document?._id || '').replace(/^drafts\./, '');
	const seriesId = String(value.series._ref).replace(/^drafts\./, '');
	const client = context.getClient({apiVersion});
	const duplicate = await client.fetch(
		`*[
			_type in ["post", "note"]
			&& !(_id in path("drafts.**"))
			&& _id != $documentId
			&& references($seriesId)
			&& series.order == $order
		][0]._id`,
		{documentId, seriesId, order: value.order},
	);

	return duplicate ? '同一系列中的顺序不能重复。' : true;
}

export const note = defineType({
	name: 'note',
	title: '笔记',
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
			name: 'pubDate',
			title: '发布日期',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'updatedDate',
			title: '更新日期',
			type: 'datetime',
		}),
		defineField({
			name: 'tags',
			title: '标签',
			type: 'array',
			of: [defineArrayMember({type: 'string'})],
			options: {layout: 'tags'},
			initialValue: [],
		}),
		defineField({
			name: 'topics',
			title: '专题',
			type: 'array',
			of: [defineArrayMember({type: 'reference', to: [{type: 'topic'}]})],
			initialValue: [],
		}),
		defineField({
			name: 'series',
			title: '所属系列',
			type: 'object',
			fields: [
				defineField({
					name: 'series',
					title: '系列',
					type: 'reference',
					to: [{type: 'series'}],
				}),
				defineField({
					name: 'order',
					title: '系列顺序',
					type: 'number',
					validation: (Rule) => Rule.integer().positive(),
				}),
			],
			validation: (Rule) => Rule.custom(uniqueSeriesOrder),
		}),
		defineField({
			name: 'featured',
			title: '首页精选',
			type: 'boolean',
			initialValue: false,
		}),
		defineField({
			name: 'canonicalURL',
			title: 'Canonical URL',
			type: 'url',
		}),
		defineField({
			name: 'body',
			title: '正文',
			type: 'portableText',
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {title: 'title', subtitle: 'slug.current'},
	},
	orderings: [
		{
			title: '发布日期倒序',
			name: 'pubDateDesc',
			by: [{field: 'pubDate', direction: 'desc'}],
		},
	],
});
