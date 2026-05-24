#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
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

function expectFile(filePath, label = relative(filePath)) {
	if (!exists(filePath) || !fs.statSync(filePath).isFile()) {
		fail(`Missing ${label}`);
	}
}

function listFiles(dir, extensions) {
	if (!exists(dir)) return [];
	const files = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...listFiles(fullPath, extensions));
		} else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
			files.push(fullPath);
		}
	}
	return files;
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
		data[key] = value;
	}

	return {
		title: scalar(data.title),
		draft: data.draft === 'true',
	};
}

function scalar(value = '') {
	const trimmed = value.trim();
	const quote = trimmed[0];
	if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function collectionEntries(collection) {
	const baseDir = path.join(contentDir, collection);
	return listFiles(baseDir, ['.md', '.mdx']).map((filePath) => {
		const parsed = parseFrontmatter(filePath);
		const slug = path
			.relative(baseDir, filePath)
			.replaceAll(path.sep, '/')
			.replace(/\.mdx?$/i, '');

		return {
			collection,
			filePath,
			slug,
			title: parsed.title,
			draft: parsed.draft,
		};
	});
}

function encodeSlug(slug) {
	return slug.split('/').map(encodeURIComponent).join('/');
}

function contentPagePath(collection, slug) {
	return path.join(distDir, collection, ...slug.split('/'), 'index.html');
}

function contentUrl(collection, slug) {
	return `/${collection}/${encodeSlug(slug)}/`;
}

function ogPath(slug) {
	const parts = slug.split('/');
	const filename = `${parts.pop()}.png`;
	return path.join(distDir, 'og', ...parts, filename);
}

function readIfPresent(filePath) {
	return exists(filePath) ? readText(filePath) : '';
}

if (!exists(distDir)) {
	fail('Missing dist/. Run npm run build before verification.');
}

expectFile(path.join(distDir, 'index.html'));
expectFile(path.join(distDir, 'rss.xml'));
expectFile(path.join(distDir, 'sitemap-index.xml'));
expectFile(path.join(distDir, 'pagefind', 'pagefind.js'));
expectFile(path.join(distDir, 'pagefind', 'pagefind-entry.json'));

const blogEntries = collectionEntries('blog');
const noteEntries = collectionEntries('notes');
const projectEntries = collectionEntries('projects');
const topicEntries = collectionEntries('topics');
const seriesEntries = collectionEntries('series');
const searchableEntries = [...blogEntries, ...noteEntries, ...projectEntries];
const publicSearchableEntries = searchableEntries.filter((entry) => !entry.draft);
const publicBlogEntries = blogEntries.filter((entry) => !entry.draft);
const draftBlogEntries = blogEntries.filter((entry) => entry.draft);
const draftSearchableEntries = searchableEntries.filter((entry) => entry.draft);
const publicStructureEntries = [...topicEntries, ...seriesEntries].filter((entry) => !entry.draft);
const draftStructureEntries = [...topicEntries, ...seriesEntries].filter((entry) => entry.draft);

const rssText = readIfPresent(path.join(distDir, 'rss.xml'));
const sitemapText = listFiles(distDir, ['.xml'])
	.filter((filePath) => path.basename(filePath).includes('sitemap'))
	.map(readText)
	.join('\n');

if (/@fs\/|(^|[^A-Za-z])[A-Za-z]:[\\/]/.test(rssText)) {
	fail('RSS contains a local filesystem asset URL.');
}

for (const entry of publicSearchableEntries) {
	const pagePath = contentPagePath(entry.collection, entry.slug);
	expectFile(pagePath, `${entry.collection} page for ${entry.slug}`);

	const url = contentUrl(entry.collection, entry.slug);
	if (!sitemapText.includes(url)) {
		fail(`Sitemap is missing ${url}`);
	}
}

for (const entry of publicStructureEntries) {
	const pagePath = contentPagePath(entry.collection, entry.slug);
	expectFile(pagePath, `${entry.collection} page for ${entry.slug}`);

	const url = contentUrl(entry.collection, entry.slug);
	if (!sitemapText.includes(url)) {
		fail(`Sitemap is missing ${url}`);
	}
}

for (const entry of draftSearchableEntries) {
	const pagePath = contentPagePath(entry.collection, entry.slug);
	const url = contentUrl(entry.collection, entry.slug);

	if (exists(pagePath)) {
		fail(`Draft page was generated: ${relative(pagePath)}`);
	}
	if (sitemapText.includes(url)) {
		fail(`Sitemap includes draft URL ${url}`);
	}
}

for (const entry of draftStructureEntries) {
	const pagePath = contentPagePath(entry.collection, entry.slug);
	const url = contentUrl(entry.collection, entry.slug);

	if (exists(pagePath)) {
		fail(`Draft page was generated: ${relative(pagePath)}`);
	}
	if (sitemapText.includes(url)) {
		fail(`Sitemap includes draft URL ${url}`);
	}
}

for (const entry of publicBlogEntries) {
	const url = contentUrl(entry.collection, entry.slug);
	if (!rssText.includes(url)) {
		fail(`RSS is missing ${url}`);
	}
	expectFile(ogPath(entry.slug), `OG image for ${entry.slug}`);
}

for (const entry of draftBlogEntries) {
	const url = contentUrl(entry.collection, entry.slug);
	const imagePath = ogPath(entry.slug);

	if (rssText.includes(url)) {
		fail(`RSS includes draft URL ${url}`);
	}
	if (exists(imagePath)) {
		fail(`Draft OG image was generated: ${relative(imagePath)}`);
	}
}

const pagefindEntryPath = path.join(distDir, 'pagefind', 'pagefind-entry.json');
if (exists(pagefindEntryPath)) {
	try {
		const pagefindEntry = JSON.parse(readText(pagefindEntryPath));
		const pageCount = Object.values(pagefindEntry.languages ?? {}).reduce(
			(total, language) => total + Number(language.page_count ?? 0),
			0,
		);
		if (pageCount !== publicSearchableEntries.length) {
			fail(`Pagefind indexed ${pageCount} pages, expected ${publicSearchableEntries.length}`);
		}
	} catch (error) {
		fail(`Could not parse dist/pagefind/pagefind-entry.json: ${error.message}`);
	}
}

if (failures.length > 0) {
	console.error('dist verification failed:');
	for (const message of failures) {
		console.error(`- ${message}`);
	}
	process.exit(1);
}

console.log(
	`dist verification passed: ${publicSearchableEntries.length} public content pages, ${publicBlogEntries.length} RSS/OG blog entries.`,
);
