#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import MarkdownIt from 'markdown-it';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'src', 'content');
const outDir = path.join(rootDir, 'tmp', 'sanity-migration');
const outFile = path.join(outDir, 'content.ndjson');
const reportFile = path.join(outDir, 'report.json');
const md = new MarkdownIt({html: false, linkify: true});
const failures = [];
const warnings = [];

function exists(filePath) {
	return fs.existsSync(filePath);
}

function readText(filePath) {
	return fs.readFileSync(filePath, 'utf8');
}

function relative(filePath) {
	return path.relative(rootDir, filePath).replaceAll(path.sep, '/') || '.';
}

function listFiles(dir, extensions = ['.md', '.mdx']) {
	if (!exists(dir)) return [];
	const files = [];
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...listFiles(fullPath, extensions));
		else if (extensions.includes(path.extname(entry.name).toLowerCase())) files.push(fullPath);
	}
	return files;
}

function scalar(value = '') {
	const trimmed = value.trim();
	const quote = trimmed[0];
	if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function parseArray(value = '') {
	const match = value.match(/^\[(.*)\]$/);
	if (!match) return [];
	return match[1]
		.split(',')
		.map((item) => scalar(item.trim()))
		.filter(Boolean);
}

function parseInlineObject(value = '') {
	const match = value.match(/^\{(.*)\}$/);
	if (!match) return undefined;
	const result = {};
	for (const part of match[1].split(',')) {
		const separator = part.indexOf(':');
		if (separator === -1) continue;
		const key = part.slice(0, separator).trim();
		const rawValue = part.slice(separator + 1).trim();
		result[key] = /^\d+$/.test(rawValue) ? Number(rawValue) : scalar(rawValue);
	}
	return result;
}

function parseFrontmatter(filePath) {
	const text = readText(filePath);
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const frontmatter = match ? match[1] : '';
	const body = match ? text.slice(match[0].length) : text;
	const data = {};

	for (const rawLine of frontmatter.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;
		const separator = line.indexOf(':');
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		if (value.startsWith('[')) data[key] = parseArray(value);
		else if (value.startsWith('{')) data[key] = parseInlineObject(value);
		else if (value === 'true' || value === 'false') data[key] = value === 'true';
		else data[key] = scalar(value);
	}

	return {data, body};
}

function key(prefix = 'item') {
	return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function slugFor(collection, filePath) {
	const baseDir = path.join(contentDir, collection);
	return path.relative(baseDir, filePath).replaceAll(path.sep, '/').replace(/\.mdx?$/i, '');
}

function slugFromContentPath(filePath) {
	const relativePath = path.relative(contentDir, filePath).replaceAll(path.sep, '/');
	const [collection] = relativePath.split('/');
	if (!collection) return undefined;
	return slugFor(collection, filePath);
}

function docId(type, slug) {
	return `${type}.${slug.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
}

function ref(type, slug) {
	return {
		_type: 'reference',
		_ref: docId(type, slug),
		_key: key('ref'),
	};
}

function fail(filePath, message) {
	failures.push({file: relative(filePath), slug: slugFromContentPath(filePath), message});
}

function assertConvertible(filePath, body) {
	if (/^\s*import\s.+from\s+['"].+['"];?/m.test(body)) {
		fail(filePath, 'MDX import is not convertible to Portable Text.');
	}
	if (/<[A-Z][A-Za-z0-9]*(\s|>|\/>)/.test(body)) {
		fail(filePath, 'MDX component usage is not convertible to Portable Text.');
	}
	if (/<\/?[a-z][\s\S]*?>/i.test(body)) {
		fail(filePath, 'Raw HTML is not convertible to Portable Text.');
	}
}

function textSpan(text, marks = []) {
	return {
		_type: 'span',
		_key: key('span'),
		text,
		marks,
	};
}

function textBlock(style, children, extra = {}) {
	return {
		_type: 'block',
		_key: key('block'),
		style,
		markDefs: [],
		children: children.length > 0 ? children : [textSpan('')],
		...extra,
	};
}

function inlineChildren(filePath, inlineToken) {
	const children = [];
	const markDefs = [];
	const markStack = [];
	const tokens = inlineToken.children ?? [];

	for (const token of tokens) {
		if (token.type === 'text') {
			children.push(textSpan(token.content, markStack));
		} else if (token.type === 'code_inline') {
			children.push(textSpan(token.content, [...markStack, 'code']));
		} else if (token.type === 'softbreak' || token.type === 'hardbreak') {
			children.push(textSpan('\n', markStack));
		} else if (token.type === 'strong_open') {
			markStack.push('strong');
		} else if (token.type === 'strong_close') {
			markStack.pop();
		} else if (token.type === 'em_open') {
			markStack.push('em');
		} else if (token.type === 'em_close') {
			markStack.pop();
		} else if (token.type === 'link_open') {
			const href = token.attrGet('href');
			const markKey = key('link');
			markDefs.push({_type: 'link', _key: markKey, href, blank: /^https?:\/\//i.test(href ?? '')});
			markStack.push(markKey);
		} else if (token.type === 'link_close') {
			markStack.pop();
		} else if (token.type === 'image') {
			fail(filePath, 'Markdown image migration requires uploading the asset to Sanity first.');
		} else if (token.type === 'html_inline') {
			fail(filePath, 'Inline HTML is not convertible to Portable Text.');
		} else {
			if (token.content) children.push(textSpan(token.content, markStack));
		}
	}

	return {children, markDefs};
}

function assignMarkDefs(block, markDefs) {
	return {...block, markDefs};
}

function tableFromTokens(tokens, startIndex) {
	const rows = [];
	let currentRow = null;

	for (let index = startIndex; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (token.type === 'table_close') return {index, block: {_type: 'table', _key: key('table'), rows}};
		if (token.type === 'tr_open') currentRow = [];
		if ((token.type === 'th_close' || token.type === 'td_close') && currentRow) continue;
		if (token.type === 'inline' && currentRow) currentRow.push(token.content);
		if (token.type === 'tr_close' && currentRow) {
			rows.push({_key: key('row'), _type: 'object', cells: currentRow});
			currentRow = null;
		}
	}

	return {index: startIndex, block: null};
}

function portableTextFromMarkdown(filePath, body) {
	assertConvertible(filePath, body);
	const tokens = md.parse(body, {});
	const blocks = [];
	const listStack = [];

	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (token.type === 'html_block') {
			fail(filePath, 'HTML block is not convertible to Portable Text.');
		} else if (token.type === 'heading_open') {
			const inline = tokens[index + 1];
			const style = token.tag;
			const {children, markDefs} = inlineChildren(filePath, inline);
			blocks.push(assignMarkDefs(textBlock(style, children), markDefs));
			index += 2;
		} else if (token.type === 'paragraph_open') {
			const inline = tokens[index + 1];
			const {children, markDefs} = inlineChildren(filePath, inline);
			const list = listStack.at(-1);
			blocks.push(assignMarkDefs(textBlock('normal', children, list ? {
				listItem: list.type,
				level: list.level,
			} : {}), markDefs));
			index += 2;
		} else if (token.type === 'bullet_list_open') {
			listStack.push({type: 'bullet', level: listStack.length + 1});
		} else if (token.type === 'ordered_list_open') {
			listStack.push({type: 'number', level: listStack.length + 1});
		} else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
			listStack.pop();
		} else if (token.type === 'fence' || token.type === 'code_block') {
			blocks.push({
				_type: 'code',
				_key: key('code'),
				language: token.info?.trim() || 'text',
				code: token.content,
			});
		} else if (token.type === 'blockquote_open') {
			const inline = tokens.find((item, offset) => offset > index && item.type === 'inline');
			if (inline) {
				const {children, markDefs} = inlineChildren(filePath, inline);
				blocks.push(assignMarkDefs(textBlock('blockquote', children), markDefs));
			}
			while (tokens[index] && tokens[index].type !== 'blockquote_close') index += 1;
		} else if (token.type === 'hr') {
			blocks.push(textBlock('normal', [textSpan('---')]));
		} else if (token.type === 'table_open') {
			const table = tableFromTokens(tokens, index);
			if (table.block) blocks.push(table.block);
			index = table.index;
		}
	}

	return blocks;
}

function contentDocument(collection, filePath) {
	const slug = slugFor(collection, filePath);
	const {data, body} = parseFrontmatter(filePath);
	const type = collection === 'blog' ? 'post' : collection === 'notes' ? 'note' : 'project';
	const doc = {
		_id: docId(type, slug),
		_type: type,
		title: data.title,
		slug: {_type: 'slug', current: slug},
		description: data.description,
		featured: Boolean(data.featured),
		body: portableTextFromMarkdown(filePath, body),
	};

	if (type === 'post' || type === 'note') {
		doc.pubDate = new Date(data.pubDate || Date.now()).toISOString();
		if (data.updatedDate) doc.updatedDate = new Date(data.updatedDate).toISOString();
		if (data.heroImage) {
			fail(filePath, 'Frontmatter heroImage requires uploading the asset to Sanity Media Library before import.');
		}
		doc.tags = Array.isArray(data.tags) ? data.tags : [];
		doc.topics = (Array.isArray(data.topics) ? data.topics : []).map((slug) => ref('topic', slug));
		if (data.series?.slug) {
			doc.series = {
				_type: 'object',
				series: {_type: 'reference', _ref: docId('series', data.series.slug)},
				order: data.series.order,
			};
		}
		if (data.canonicalURL) doc.canonicalURL = data.canonicalURL;
	}

	if (type === 'project') {
		doc.status = data.status || 'active';
		doc.stack = Array.isArray(data.stack) ? data.stack : [];
		doc.order = Number(data.order || 999);
		doc.repoUrl = data.repoUrl || undefined;
		doc.demoUrl = data.demoUrl || undefined;
		doc.topics = (Array.isArray(data.topics) ? data.topics : []).map((slug) => ref('topic', slug));
	}

	return doc;
}

function structureDocument(collection, filePath) {
	const slug = slugFor(collection, filePath);
	const {data} = parseFrontmatter(filePath);
	const type = collection === 'topics' ? 'topic' : 'series';
	return {
		_id: docId(type, slug),
		_type: type,
		title: data.title,
		slug: {_type: 'slug', current: slug},
		description: data.description,
		order: Number(data.order || 999),
		featured: Boolean(data.featured),
	};
}

const docs = [];
for (const collection of ['topics', 'series']) {
	for (const filePath of listFiles(path.join(contentDir, collection))) {
		docs.push(structureDocument(collection, filePath));
	}
}

for (const collection of ['blog', 'notes', 'projects']) {
	for (const filePath of listFiles(path.join(contentDir, collection))) {
		docs.push(contentDocument(collection, filePath));
	}
}

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(outFile, docs.map((doc) => JSON.stringify(doc)).join('\n') + '\n');
fs.writeFileSync(reportFile, JSON.stringify({documents: docs.length, failures, warnings}, null, 2));

if (failures.length > 0) {
	console.error('Sanity migration generated a report with blocking failures:');
	for (const failure of failures) {
		console.error(`- ${failure.slug ?? 'unknown'} (${failure.file}): ${failure.message}`);
	}
	console.error(`Report: ${relative(reportFile)}`);
	process.exit(1);
}

console.log(`Sanity migration dataset written to ${relative(outFile)} (${docs.length} documents).`);
console.log(`Report: ${relative(reportFile)}`);
