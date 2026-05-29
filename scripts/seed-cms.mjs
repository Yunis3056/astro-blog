#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createClient} from '@sanity/client';
import {loadEnv} from 'vite';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'tmp', 'sanity-seed');
const outFile = path.join(outDir, 'sample-documents.json');
const env = loadEnv(process.env.NODE_ENV || 'development', rootDir, '');
const envValue = (key) => process.env[key] || env[key];
const projectId = envValue('PUBLIC_SANITY_PROJECT_ID') || envValue('SANITY_STUDIO_PROJECT_ID');
const dataset = envValue('PUBLIC_SANITY_DATASET') || envValue('SANITY_STUDIO_DATASET') || 'production-blog';
const apiVersion = envValue('SANITY_API_VERSION') || '2025-02-19';
const token = envValue('SANITY_API_WRITE_TOKEN') || envValue('SANITY_AUTH_TOKEN');
let keyIndex = 0;

function key(prefix) {
	keyIndex += 1;
	return `${prefix}-${String(keyIndex).padStart(4, '0')}`;
}

function slug(value) {
	return {_type: 'slug', current: value};
}

function ref(type, value) {
	return {_type: 'reference', _ref: `${type}.${value}`, _key: key('ref')};
}

function span(text, marks = []) {
	return {_type: 'span', _key: key('span'), text, marks};
}

function block(style, text) {
	return {
		_type: 'block',
		_key: key('block'),
		style,
		markDefs: [],
		children: [span(text)],
	};
}

function listItem(text) {
	return {
		_type: 'block',
		_key: key('block'),
		style: 'normal',
		listItem: 'bullet',
		level: 1,
		markDefs: [],
		children: [span(text)],
	};
}

function code(language, filename, source) {
	return {
		_type: 'code',
		_key: key('code'),
		language,
		filename,
		code: source,
	};
}

function table(rows) {
	return {
		_type: 'table',
		_key: key('table'),
		rows: rows.map((cells) => ({
			_key: key('row'),
			_type: 'object',
			cells,
		})),
	};
}

const docs = [
	{
		_id: 'siteSettings',
		_type: 'siteSettings',
		title: 'Yunis 的博客',
		description: '一个用于沉淀工程实践、写作方法和产品化经验的中文知识系统。',
	},
	{
		_id: 'topic.site-engineering',
		_type: 'topic',
		title: '站点工程',
		slug: slug('site-engineering'),
		description: '记录 Astro、Sanity、搜索、部署、质量门禁等博客工程化实践。',
		order: 1,
		featured: true,
	},
	{
		_id: 'topic.writing-system',
		_type: 'topic',
		title: '写作系统',
		slug: slug('writing-system'),
		description: '围绕选题、结构、复盘和长期输出建立可持续的写作流程。',
		order: 2,
		featured: true,
	},
	{
		_id: 'topic.product-thinking',
		_type: 'topic',
		title: '产品思考',
		slug: slug('product-thinking'),
		description: '把工具、内容和增长闭环连接起来，关注实际使用体验。',
		order: 3,
		featured: true,
	},
	{
		_id: 'series.blog-v5-upgrade',
		_type: 'series',
		title: '博客 5.0 升级',
		slug: slug('blog-v5-upgrade'),
		description: '从本地 Markdown 迁移到 Sanity 在线写作平台的完整升级记录。',
		order: 1,
		featured: true,
	},
	{
		_id: 'series.online-writing-workflow',
		_type: 'series',
		title: '线上写作工作流',
		slug: slug('online-writing-workflow'),
		description: '从选题、草稿、预览到发布检查的一套在线写作流程。',
		order: 2,
		featured: true,
	},
	{
		_id: 'post.sanity-online-authoring',
		_type: 'post',
		title: '为什么 5.0 要迁移到 Sanity 在线写作',
		slug: slug('sanity-online-authoring'),
		description: '本地复制 Markdown 文件已经不适合长期维护，在线写作让内容生产、预览和发布变成同一条链路。',
		pubDate: '2026-05-24T08:00:00.000Z',
		updatedDate: '2026-05-24T08:00:00.000Z',
		tags: ['Sanity', 'Astro', 'CMS'],
		topics: [ref('topic', 'site-engineering'), ref('topic', 'writing-system')],
		series: {
			_type: 'object',
			series: {_type: 'reference', _ref: 'series.blog-v5-upgrade'},
			order: 1,
		},
		featured: true,
		body: [
			block('normal', '5.0 的目标不是把 Markdown 换一个存放位置，而是把写作、预览、发布和质量检查连成一个可维护的平台。'),
			block('h2', '升级重点'),
			listItem('Sanity Studio 负责在线写作、草稿和媒体管理。'),
			listItem('Astro 继续负责公开页面、SEO、RSS、Sitemap 和搜索索引。'),
			listItem('Vercel 混合渲染承接后台、预览和公开站点构建。'),
			block('h2', '判断标准'),
			block('normal', '如果一篇文章从创建到发布不再需要复制文件、不再手动整理 frontmatter，这次升级才算真正完成。'),
		],
	},
	{
		_id: 'post.visual-preview-publishing',
		_type: 'post',
		title: '可视化预览如何改变发布流程',
		slug: slug('visual-preview-publishing'),
		description: 'Presentation Tool 和草稿模式让编辑可以在发布前看到真实页面，而不是只盯着字段表单。',
		pubDate: '2026-05-24T09:00:00.000Z',
		tags: ['Preview', 'Publishing', 'Workflow'],
		topics: [ref('topic', 'site-engineering'), ref('topic', 'product-thinking')],
		series: {
			_type: 'object',
			series: {_type: 'reference', _ref: 'series.blog-v5-upgrade'},
			order: 2,
		},
		featured: true,
		body: [
			block('normal', '可视化预览的价值在于缩短反馈距离。标题、摘要、正文和专题关系，都能在接近真实页面的环境中检查。'),
			block('h2', '编辑侧收益'),
			listItem('草稿不会进入公开 RSS、Sitemap 和 Pagefind。'),
			listItem('发布前可以验证页面结构、相关文章和系列顺序。'),
			listItem('字段和页面位置之间的关系更直观。'),
			code('ts', 'draft-mode.ts', "cookies.set('sanity-preview', 'enabled', { path: '/', httpOnly: true });"),
		],
	},
	{
		_id: 'post.content-quality-gates',
		_type: 'post',
		title: '内容质量门禁应该检查什么',
		slug: slug('content-quality-gates'),
		description: 'CMS 迁移后，质量门禁从文件扫描升级为对 Sanity 数据、引用关系和构建产物的检查。',
		pubDate: '2026-05-24T10:00:00.000Z',
		tags: ['Quality', 'CI', 'Content'],
		topics: [ref('topic', 'site-engineering')],
		series: {
			_type: 'object',
			series: {_type: 'reference', _ref: 'series.blog-v5-upgrade'},
			order: 3,
		},
		featured: false,
		body: [
			block('normal', '内容平台上线后，真正需要防的是引用断裂、草稿泄露、系列顺序冲突和构建产物缺失。'),
			table([
				['检查项', '失败条件'],
				['专题引用', '文章引用了不存在的 topic'],
				['系列顺序', '同一系列中两个内容使用相同 order'],
				['公开入口', '草稿进入 RSS、Sitemap 或搜索索引'],
			]),
		],
	},
	{
		_id: 'note.first-online-draft',
		_type: 'note',
		title: '第一条在线笔记',
		slug: slug('first-online-draft'),
		description: '用 Sanity Studio 写一条短笔记，验证笔记列表、标签、专题和正文渲染。',
		pubDate: '2026-05-24T11:00:00.000Z',
		tags: ['Note', 'Studio'],
		topics: [ref('topic', 'writing-system')],
		series: {
			_type: 'object',
			series: {_type: 'reference', _ref: 'series.online-writing-workflow'},
			order: 1,
		},
		featured: true,
		body: [
			block('normal', '短笔记适合记录还没有形成完整文章的想法。它应该足够轻，但仍然进入统一的知识结构。'),
			listItem('先记录判断，再补证据。'),
			listItem('先归入专题，再决定是否进入系列。'),
		],
	},
	{
		_id: 'note.publish-checklist',
		_type: 'note',
		title: '发布前检查清单',
		slug: slug('publish-checklist'),
		description: '一条用于验证质量门禁和发布流程的示例笔记。',
		pubDate: '2026-05-24T12:00:00.000Z',
		tags: ['Checklist', 'Publishing'],
		topics: [ref('topic', 'writing-system'), ref('topic', 'site-engineering')],
		series: {
			_type: 'object',
			series: {_type: 'reference', _ref: 'series.online-writing-workflow'},
			order: 2,
		},
		featured: false,
		body: [
			block('normal', '每次发布前至少检查标题、摘要、专题、系列顺序、正文结构和链接。'),
			listItem('标题能否单独表达主题。'),
			listItem('摘要是否说明读者会获得什么。'),
			listItem('专题和系列是否会帮助后续导航。'),
		],
	},
	{
		_id: 'project.sanity-writing-desk',
		_type: 'project',
		title: 'Sanity 写作工作台',
		slug: slug('sanity-writing-desk'),
		description: '把博客后台从文件夹迁移到在线 Studio，支持草稿、预览、专题和系列。',
		status: 'active',
		stack: ['Astro', 'Sanity', 'Vercel', 'Pagefind'],
		order: 1,
		topics: [ref('topic', 'site-engineering'), ref('topic', 'product-thinking')],
		featured: true,
		body: [
			block('normal', '这个项目的核心价值是减少发布摩擦，让内容生产从本地文件操作升级为在线工作台。'),
			block('h2', '当前阶段'),
			block('normal', '基础 schema、Studio、公开查询层、搜索索引和验证脚本已经串起来，下一步是正式迁移旧内容。'),
		],
	},
	{
		_id: 'project.knowledge-navigation',
		_type: 'project',
		title: '知识导航实验',
		slug: slug('knowledge-navigation'),
		description: '用专题、系列、标签和相关文章组成多层导航，降低内容沉淀后的查找成本。',
		status: 'planned',
		stack: ['Information Architecture', 'Search', 'Content Design'],
		order: 2,
		topics: [ref('topic', 'writing-system'), ref('topic', 'product-thinking')],
		featured: true,
		body: [
			block('normal', '长期写作的难点不是内容数量，而是内容之间的关系能否被持续维护。'),
			block('h2', '实验目标'),
			listItem('专题承担主导航。'),
			listItem('系列承担连续阅读路径。'),
			listItem('标签保留为细粒度关键词。'),
		],
	},
];

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(outFile, `${JSON.stringify(docs, null, 2)}\n`);

if (!projectId) {
	console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_STUDIO_PROJECT_ID.');
	process.exit(1);
}

if (!token) {
	console.log(`Sample documents written to ${path.relative(rootDir, outFile).replaceAll(path.sep, '/')}.`);
	console.log('Set SANITY_API_WRITE_TOKEN or SANITY_AUTH_TOKEN to write these documents to Sanity.');
	process.exit(1);
}

const client = createClient({
	projectId,
	dataset,
	apiVersion,
	token,
	useCdn: false,
});

let transaction = client.transaction();
for (const doc of docs) {
	transaction = transaction.createOrReplace(doc);
}

await transaction.commit({visibility: 'sync'});

console.log(`Seeded ${docs.length} sample documents into Sanity dataset ${dataset}.`);
console.log(`Sample documents written to ${path.relative(rootDir, outFile).replaceAll(path.sep, '/')}.`);
