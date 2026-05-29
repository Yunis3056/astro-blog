import {defineField, defineType} from 'sanity';

export const richImage = defineType({
	name: 'richImage',
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
});
