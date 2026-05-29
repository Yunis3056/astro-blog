#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distCandidates = [
	path.join(rootDir, 'dist'),
	path.join(rootDir, 'dist', 'client'),
	path.join(rootDir, '.vercel', 'output', 'static'),
];
const distDir = distCandidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html'))) ?? distCandidates[0];
const localOrigin = 'https://local.invalid';
const siteOrigin = readSiteOrigin();

const failures = [];
let checkedInternalUrls = 0;
let skippedExternalUrls = 0;

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

function readSiteOrigin() {
	const configPath = path.join(rootDir, 'astro.config.mjs');
	if (!exists(configPath)) return null;

	const configText = readText(configPath);
	const match = configText.match(/\bsite:\s*['"`]([^'"`]+)['"`]/);
	if (!match) return null;

	try {
		return new URL(match[1]).origin;
	} catch {
		return null;
	}
}

function publicPathForHtml(filePath) {
	const rel = path.relative(distDir, filePath).replaceAll(path.sep, '/');
	if (rel === 'index.html') return '/';
	if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
	return `/${rel}`;
}

function decodeHtml(value) {
	return value
		.replaceAll('&amp;', '&')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&apos;', "'");
}

function isSkippable(rawUrl) {
	const lower = rawUrl.toLowerCase();
	return (
		rawUrl === ''
		|| lower.startsWith('data:')
		|| lower.startsWith('mailto:')
		|| lower.startsWith('tel:')
		|| lower.startsWith('javascript:')
	);
}

function safeDecode(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function fileForUrlPath(urlPath) {
	const decodedPath = safeDecode(urlPath);
	const relPath = decodedPath.replace(/^\/+/, '');

	if (decodedPath === '/') {
		return path.join(distDir, 'index.html');
	}

	const candidates = [];
	if (decodedPath.endsWith('/')) {
		candidates.push(path.join(distDir, relPath, 'index.html'));
	} else {
		candidates.push(path.join(distDir, relPath));
		candidates.push(path.join(distDir, relPath, 'index.html'));
		if (!path.extname(relPath)) {
			candidates.push(path.join(distDir, `${relPath}.html`));
		}
	}

	return candidates.find((candidate) => exists(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function collectIds(html) {
	const ids = new Set();
	const attrPattern = /\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
	let match;

	while ((match = attrPattern.exec(html))) {
		const value = decodeHtml(match[1] ?? match[2] ?? match[3] ?? '');
		ids.add(value);
		ids.add(safeDecode(value));
	}

	return ids;
}

function lineNumber(source, index) {
	return source.slice(0, index).split(/\r?\n/).length;
}

function srcsetUrls(value) {
	return value
		.split(',')
		.map((part) => part.trim().split(/\s+/)[0])
		.filter(Boolean);
}

function maskEmbeddedCode(html) {
	return html
		.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (_match, open, body, close) => {
			return `${open}${body.replace(/[^\r\n]/g, ' ')}${close}`;
		})
		.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_match, open, body, close) => {
			return `${open}${body.replace(/[^\r\n]/g, ' ')}${close}`;
		});
}

function checkUrl(rawValue, pageFile, pageHtml, matchIndex) {
	const rawUrl = decodeHtml(rawValue).trim();
	if (isSkippable(rawUrl)) return;

	const baseUrl = new URL(publicPathForHtml(pageFile), localOrigin);
	let resolved;
	try {
		resolved = new URL(rawUrl, baseUrl);
	} catch (error) {
		fail(`${relative(pageFile)}:${lineNumber(pageHtml, matchIndex)} has invalid URL "${rawUrl}": ${error.message}`);
		return;
	}

	const isLocal = resolved.origin === localOrigin || (siteOrigin && resolved.origin === siteOrigin);
	if (!isLocal) {
		skippedExternalUrls += 1;
		return;
	}

	checkedInternalUrls += 1;
	const targetFile = fileForUrlPath(resolved.pathname);
	if (!targetFile) {
		fail(`${relative(pageFile)}:${lineNumber(pageHtml, matchIndex)} links to missing internal target ${resolved.pathname}`);
		return;
	}

	if (resolved.hash && path.extname(targetFile).toLowerCase() === '.html') {
		const targetHtml = readText(targetFile);
		const ids = collectIds(targetHtml);
		const fragment = resolved.hash.slice(1);
		const decodedFragment = safeDecode(fragment);
		if (!ids.has(fragment) && !ids.has(decodedFragment)) {
			fail(
				`${relative(pageFile)}:${lineNumber(pageHtml, matchIndex)} links to missing fragment #${decodedFragment} in ${relative(targetFile)}`,
			);
		}
	}
}

if (!exists(distDir)) {
	fail('Missing dist/. Run npm run build before link verification.');
}

const htmlFiles = listFiles(distDir, ['.html']);
const attrPattern = /\b(href|src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

for (const pageFile of htmlFiles) {
	const html = readText(pageFile);
	const htmlForAttributes = maskEmbeddedCode(html);
	let match;

	while ((match = attrPattern.exec(htmlForAttributes))) {
		const attr = match[1].toLowerCase();
		const value = match[2] ?? match[3] ?? match[4] ?? '';
		const urls = attr === 'srcset' ? srcsetUrls(value) : [value];
		for (const url of urls) {
			checkUrl(url, pageFile, html, match.index);
		}
	}
}

if (failures.length > 0) {
	console.error('internal link verification failed:');
	for (const message of failures) {
		console.error(`- ${message}`);
	}
	process.exit(1);
}

console.log(
	`internal link verification passed: ${checkedInternalUrls} internal URLs checked, ${skippedExternalUrls} external URLs skipped.`,
);
