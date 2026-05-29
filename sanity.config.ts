import {visionTool} from '@sanity/vision';
import {definePreviewUrl} from '@sanity/preview-url-secret/define-preview-url';
import {defineConfig} from 'sanity';
import {presentationTool, defineDocuments, defineLocations} from 'sanity/presentation';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './sanity/schemaTypes';
import {singletonActions, structure} from './sanity/structure';

const processEnv = typeof process === 'undefined' ? {} : process.env;
const envValue = (key: string) => import.meta.env[key] || processEnv[key];
const projectId = envValue('SANITY_STUDIO_PROJECT_ID') || envValue('PUBLIC_SANITY_PROJECT_ID') || 'placeholder';
const dataset = envValue('SANITY_STUDIO_DATASET') || envValue('PUBLIC_SANITY_DATASET') || 'production-blog';
const previewOrigin = envValue('SANITY_STUDIO_PREVIEW_URL') || 'http://localhost:4321';

const slugLocation = (label: string, publicPath: string, previewPath: string) =>
	defineLocations({
		select: {
			title: 'title',
			slug: 'slug.current',
		},
		resolve(value) {
			const slug = value?.slug;
			if (!slug) {
				return {
					message: '先生成 slug，才能打开预览。',
					tone: 'caution',
				};
			}

			return {
				locations: [
					{title: `${label}预览`, href: `${previewPath}/${slug}/`},
					{title: `${label}公开页面`, href: `${publicPath}/${slug}/`},
				],
			};
		},
	});

export default defineConfig({
	name: 'dark-debris',
	title: 'Yunis Blog Studio',
	basePath: '/admin',
	projectId,
	dataset,
	document: {
		actions: singletonActions,
	},
	plugins: [
		structureTool({structure}),
		presentationTool({
			title: '可视化预览',
			previewUrl: definePreviewUrl({
				origin: previewOrigin,
				preview: '/',
				previewMode: {
					enable: '/api/draft-mode/enable',
					disable: '/api/draft-mode/disable',
					shareAccess: true,
				},
			}),
			resolve: {
				mainDocuments: defineDocuments([
					{
						route: '/blog/:slug',
						filter: '_type == "post" && slug.current == $slug',
						params: ({params}) => ({slug: params.slug}),
					},
					{
						route: '/notes/:slug',
						filter: '_type == "note" && slug.current == $slug',
						params: ({params}) => ({slug: params.slug}),
					},
					{
						route: '/projects/:slug',
						filter: '_type == "project" && slug.current == $slug',
						params: ({params}) => ({slug: params.slug}),
					},
					{
						route: '/topics/:slug',
						filter: '_type == "topic" && slug.current == $slug',
						params: ({params}) => ({slug: params.slug}),
					},
					{
						route: '/series/:slug',
						filter: '_type == "series" && slug.current == $slug',
						params: ({params}) => ({slug: params.slug}),
					},
				]),
				locations: {
					post: slugLocation('文章', '/blog', '/preview/blog'),
					note: slugLocation('笔记', '/notes', '/preview/notes'),
					project: slugLocation('项目', '/projects', '/preview/projects'),
					topic: slugLocation('专题', '/topics', '/preview/topics'),
					series: slugLocation('系列', '/series', '/preview/series'),
					siteSettings: defineLocations({
						locations: [{title: '首页', href: '/'}],
					}),
				},
			},
		}),
		visionTool({defaultApiVersion: envValue('SANITY_API_VERSION') || '2025-02-19'}),
	],
	schema: {
		types: schemaTypes,
	},
});
