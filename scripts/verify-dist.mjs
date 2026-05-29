#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const candidates = [
	path.join(rootDir, 'dist'),
	path.join(rootDir, 'dist', 'client'),
	path.join(rootDir, '.vercel', 'output', 'static'),
];
const distDir = candidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html'))) ?? candidates[0];
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
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...listFiles(fullPath, extensions));
		else if (extensions.includes(path.extname(entry.name).toLowerCase())) files.push(fullPath);
	}
	return files;
}

function readIfPresent(filePath) {
	return exists(filePath) ? readText(filePath) : '';
}

function indexedPageCount(pagefindEntry) {
	return Object.values(pagefindEntry.languages ?? {}).reduce(
		(total, language) => total + Number(language.page_count ?? 0),
		0,
	);
}

if (!exists(distDir)) {
	fail('Missing static output directory. Run npm run build before verification.');
}

expectFile(path.join(distDir, 'index.html'));
expectFile(path.join(distDir, 'rss.xml'));
expectFile(path.join(distDir, 'sitemap-index.xml'));
expectFile(path.join(distDir, 'pagefind', 'pagefind.js'));
expectFile(path.join(distDir, 'pagefind', 'pagefind-entry.json'));

const rssText = readIfPresent(path.join(distDir, 'rss.xml'));
if (/@fs\/|(^|[^A-Za-z])[A-Za-z]:[\\/]/.test(rssText)) {
	fail('RSS contains a local filesystem asset URL.');
}

const pagefindEntryPath = path.join(distDir, 'pagefind', 'pagefind-entry.json');
if (exists(pagefindEntryPath)) {
	try {
		const pagefindEntry = JSON.parse(readText(pagefindEntryPath));
		const pageCount = indexedPageCount(pagefindEntry);
		if (pageCount <= 0) {
			fail('Pagefind index contains no pages.');
		}

		const htmlFiles = listFiles(distDir, ['.html']);
		const expectedSearchPages = htmlFiles.filter((filePath) => readText(filePath).includes('data-pagefind-body'));
		if (expectedSearchPages.length > 0 && pageCount < expectedSearchPages.length) {
			fail(
				`Pagefind indexed ${pageCount} page(s), but ${expectedSearchPages.length} built HTML page(s) contain data-pagefind-body.`,
			);
		}

		for (const filePath of expectedSearchPages) {
			const html = readText(filePath);
			if (!html.includes('data-pagefind-filter="type"')) {
				fail(`${relative(filePath)} is missing the Pagefind type filter.`);
			}
			if (!html.includes('data-pagefind-sort="date"')) {
				fail(`${relative(filePath)} is missing the Pagefind date sort.`);
			}
		}
	} catch (error) {
		fail(`Could not parse ${relative(pagefindEntryPath)}: ${error.message}`);
	}
}

const sitemapText = listFiles(distDir, ['.xml'])
	.filter((filePath) => path.basename(filePath).includes('sitemap'))
	.map(readText)
	.join('\n');

for (const requiredUrl of ['/topics/', '/series/', '/blog/', '/notes/', '/projects/', '/archive/']) {
	if (!sitemapText.includes(requiredUrl)) {
		fail(`Sitemap is missing ${requiredUrl}`);
	}
}

if (failures.length > 0) {
	console.error('dist verification failed:');
	for (const message of failures) {
		console.error(`- ${message}`);
	}
	process.exit(1);
}

console.log(`dist verification passed for ${relative(distDir)}.`);
