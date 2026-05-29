#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const candidates = [
	path.join(rootDir, 'dist'),
	path.join(rootDir, 'dist', 'client'),
	path.join(rootDir, '.vercel', 'output', 'static'),
];

const siteDir = candidates.find((candidate) => {
	return fs.existsSync(path.join(candidate, 'index.html'));
});

if (!siteDir) {
	console.error('Could not find a static HTML output directory for Pagefind.');
	console.error(`Checked: ${candidates.map((item) => path.relative(rootDir, item)).join(', ')}`);
	process.exit(1);
}

const command = process.platform === 'win32'
	? path.join(rootDir, 'node_modules', '.bin', 'pagefind.cmd')
	: path.join(rootDir, 'node_modules', '.bin', 'pagefind');

const result = spawnSync(command, ['--site', siteDir], {
	stdio: 'inherit',
	shell: process.platform === 'win32',
});

if (result.error) {
	console.error(`Pagefind failed to start: ${result.error.message}`);
}

process.exit(result.status ?? 1);
