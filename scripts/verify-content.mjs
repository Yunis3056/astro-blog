#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'src', 'content');
const failures = [];

function fail(message) {
	failures.push(message);
}

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
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
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
	if (!match) return {};
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
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const frontmatter = match ? match[1] : '';
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

	return data;
}

function collectionEntries(collection) {
	const baseDir = path.join(contentDir, collection);
	return listFiles(baseDir).map((filePath) => ({
		collection,
		filePath,
		slug: path
			.relative(baseDir, filePath)
			.replaceAll(path.sep, '/')
			.replace(/\.mdx?$/i, ''),
		data: parseFrontmatter(filePath),
	}));
}

const topics = collectionEntries('topics');
const series = collectionEntries('series');
const topicSlugs = new Set(topics.map((topic) => topic.slug));
const seriesSlugs = new Set(series.map((item) => item.slug));
const contentEntries = [
	...collectionEntries('blog'),
	...collectionEntries('notes'),
	...collectionEntries('projects'),
];

if (topics.length === 0) fail('No topics defined in src/content/topics/.');
if (series.length === 0) fail('No series defined in src/content/series/.');

for (const entry of contentEntries) {
	const topics = Array.isArray(entry.data.topics) ? entry.data.topics : [];
	for (const topic of topics) {
		if (!topicSlugs.has(topic)) {
			fail(`${relative(entry.filePath)} references missing topic "${topic}".`);
		}
	}

	const series = entry.data.series;
	if (series?.slug && !seriesSlugs.has(series.slug)) {
		fail(`${relative(entry.filePath)} references missing series "${series.slug}".`);
	}
	if (series?.slug && (!Number.isInteger(series.order) || series.order <= 0)) {
		fail(`${relative(entry.filePath)} has invalid series.order for "${series.slug}".`);
	}
}

const seenSeriesOrders = new Map();
for (const entry of contentEntries.filter((item) => item.data.draft !== true)) {
	const series = entry.data.series;
	if (!series?.slug) continue;
	const key = `${series.slug}:${series.order}`;
	if (seenSeriesOrders.has(key)) {
		fail(
			`Series order conflict for ${series.slug} #${series.order}: ${relative(seenSeriesOrders.get(key))} and ${relative(entry.filePath)}.`,
		);
	}
	seenSeriesOrders.set(key, entry.filePath);
}

if (failures.length > 0) {
	console.error('content verification failed:');
	for (const message of failures) {
		console.error(`- ${message}`);
	}
	process.exit(1);
}

console.log(
	`content verification passed: ${topics.length} topics, ${series.length} series, ${contentEntries.length} content entries.`,
);
