import fs from 'node:fs';
import path from 'node:path';
import {getCliClient} from 'sanity/cli';

const rootDir = process.cwd();
const filePath = path.join(rootDir, 'tmp', 'sanity-seed', 'sample-documents.json');

if (!fs.existsSync(filePath)) {
	throw new Error('Missing tmp/sanity-seed/sample-documents.json. Run npm.cmd run seed:cms first.');
}

const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const client = getCliClient({apiVersion: '2025-02-19'});

let transaction = client.transaction();
for (const doc of docs) {
	transaction = transaction.createOrReplace(doc);
}

await transaction.commit({visibility: 'sync'});

console.log(`Seeded ${docs.length} sample documents into ${client.config().projectId}/${client.config().dataset}.`);
