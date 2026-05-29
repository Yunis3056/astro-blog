import {defineArrayMember, defineField, defineType} from 'sanity';

export const portableText = defineType({
	name: 'portableText',
	title: '正文',
	type: 'array',
	of: [
		defineArrayMember({
			type: 'block',
			styles: [
				{title: '正文', value: 'normal'},
				{title: '二级标题', value: 'h2'},
				{title: '三级标题', value: 'h3'},
				{title: '四级标题', value: 'h4'},
				{title: '引用', value: 'blockquote'},
			],
			lists: [
				{title: '项目符号', value: 'bullet'},
				{title: '数字编号', value: 'number'},
			],
			marks: {
				decorators: [
					{title: '加粗', value: 'strong'},
					{title: '斜体', value: 'em'},
					{title: '代码', value: 'code'},
				],
				annotations: [
					defineArrayMember({
						name: 'link',
						title: '链接',
						type: 'object',
						fields: [
							defineField({
								name: 'href',
								title: 'URL',
								type: 'url',
								validation: (Rule) => Rule.required(),
							}),
							defineField({
								name: 'blank',
								title: '新窗口打开',
								type: 'boolean',
								initialValue: true,
							}),
						],
					}),
				],
			},
		}),
		defineArrayMember({
			name: 'image',
			title: '图片',
			type: 'image',
			options: {hotspot: true},
			fields: [
				defineField({
					name: 'alt',
					title: '替代文本',
					type: 'string',
					validation: (Rule) => Rule.required(),
				}),
				defineField({
					name: 'caption',
					title: '说明',
					type: 'string',
				}),
			],
		}),
		defineArrayMember({
			name: 'code',
			title: '代码块',
			type: 'object',
			fields: [
				defineField({
					name: 'language',
					title: '语言',
					type: 'string',
					initialValue: 'text',
				}),
				defineField({
					name: 'filename',
					title: '文件名',
					type: 'string',
				}),
				defineField({
					name: 'code',
					title: '代码',
					type: 'text',
					rows: 12,
					validation: (Rule) => Rule.required(),
				}),
			],
			preview: {
				select: {
					title: 'filename',
					subtitle: 'language',
					code: 'code',
				},
				prepare({title, subtitle, code}) {
					return {
						title: title || '代码块',
						subtitle: subtitle || code?.slice(0, 60),
					};
				},
			},
		}),
		defineArrayMember({
			name: 'table',
			title: '表格',
			type: 'object',
			fields: [
				defineField({
					name: 'rows',
					title: '行',
					type: 'array',
					of: [
						defineArrayMember({
							type: 'object',
							fields: [
								defineField({
									name: 'cells',
									title: '单元格',
									type: 'array',
									of: [defineArrayMember({type: 'string'})],
								}),
							],
							preview: {
								select: {cells: 'cells'},
								prepare({cells}) {
									return {title: Array.isArray(cells) ? cells.join(' / ') : '表格行'};
								},
							},
						}),
					],
					validation: (Rule) => Rule.min(1),
				}),
			],
			preview: {
				select: {rows: 'rows'},
				prepare({rows}) {
					return {title: `表格 · ${Array.isArray(rows) ? rows.length : 0} 行`};
				},
			},
		}),
	],
	validation: (Rule) => Rule.required().min(1),
});
