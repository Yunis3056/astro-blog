import {defineField, defineType} from 'sanity';

export const siteSettings = defineType({
	name: 'siteSettings',
	title: '站点设置',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: '站点标题',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: '站点描述',
			type: 'text',
			rows: 3,
			validation: (Rule) => Rule.required().max(220),
		}),
		defineField({
			name: 'defaultOgImage',
			title: '默认分享图',
			type: 'richImage',
		}),
	],
	preview: {
		prepare() {
			return {title: '站点设置'};
		},
	},
});
