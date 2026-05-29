#!/usr/bin/env node
import {createClient} from '@sanity/client';
import {loadEnv} from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const envValue = (key) => process.env[key] || env[key];
const projectId = envValue('PUBLIC_SANITY_PROJECT_ID') || envValue('SANITY_STUDIO_PROJECT_ID');
const dataset = envValue('PUBLIC_SANITY_DATASET') || envValue('SANITY_STUDIO_DATASET') || 'production-blog';
const apiVersion = envValue('SANITY_API_VERSION') || '2025-02-19';
const token = envValue('SANITY_API_READ_TOKEN');
const failures = [];

function fail(message) {
	failures.push(message);
}

function describeError(error) {
	const message = error instanceof Error ? error.message : String(error);
	const code = error && typeof error === 'object' && 'code' in error ? ` (${error.code})` : '';

	if (/Dataset not found/i.test(message)) {
		return `dataset "${dataset}" was not found in Sanity project ${projectId}.`;
	}

	if (/Unauthorized|401/i.test(message)) {
		return 'request was unauthorized. Check SANITY_API_READ_TOKEN permissions.';
	}

	if (/Forbidden|403/i.test(message)) {
		return 'request was forbidden. Check the token role and dataset access.';
	}

	if (/timed out|ETIMEDOUT|ENOTFOUND|ECONNRESET|fetch failed/i.test(message)) {
		return `could not reach Sanity API${code}. Check network access and project id ${projectId}.`;
	}

	return `${message}${code}`;
}

if (!projectId) {
	fail('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_STUDIO_PROJECT_ID.');
}

if (!dataset) {
	fail('Missing PUBLIC_SANITY_DATASET or SANITY_STUDIO_DATASET.');
}

if (failures.length === 0) {
	const client = createClient({
		projectId,
		dataset,
		apiVersion,
		useCdn: false,
		token,
		timeout: 20000,
	});

	let data;
	try {
		data = await client.fetch(`{
			"topics": *[_type == "topic" && !(_id in path("drafts.**"))]{
				_id, "slug": slug.current, title
			},
			"series": *[_type == "series" && !(_id in path("drafts.**"))]{
				_id, "slug": slug.current, title
			},
			"content": *[_type in ["post", "note", "project"] && !(_id in path("drafts.**"))]{
				_id,
				_type,
				title,
				"slug": slug.current,
				"topicRefs": topics[]._ref,
				"topicSlugs": topics[]->slug.current,
				"seriesRef": series.series._ref,
				"seriesSlug": series.series->slug.current,
				"seriesOrder": series.order
			}
		}`);
	} catch (error) {
		fail(`Could not query Sanity dataset ${projectId}/${dataset}: ${describeError(error)}`);
	}

	if (data && (!Array.isArray(data.topics) || data.topics.length === 0)) {
		fail('No published topic documents found in Sanity.');
	}

	if (data && (!Array.isArray(data.series) || data.series.length === 0)) {
		fail('No published series documents found in Sanity.');
	}

	for (const item of [...data?.topics ?? [], ...data?.series ?? [], ...data?.content ?? []]) {
		if (!item.slug) {
			fail(`${item._type ?? 'document'} "${item.title ?? item._id}" is missing slug.current.`);
		}
	}

	for (const entry of data?.content ?? []) {
		const refs = Array.isArray(entry.topicRefs) ? entry.topicRefs : [];
		const slugs = Array.isArray(entry.topicSlugs) ? entry.topicSlugs : [];
		if (refs.length !== slugs.filter(Boolean).length) {
			fail(`${entry._type} "${entry.title}" has a broken topic reference.`);
		}

		if (entry.seriesRef && !entry.seriesSlug) {
			fail(`${entry._type} "${entry.title}" has a broken series reference.`);
		}

		if (entry.seriesRef && (!Number.isInteger(entry.seriesOrder) || entry.seriesOrder <= 0)) {
			fail(`${entry._type} "${entry.title}" has invalid series.order.`);
		}
	}

	const seenSeriesOrders = new Map();
	for (const entry of (data?.content ?? []).filter((item) => item._type === 'post' || item._type === 'note')) {
		if (!entry.seriesSlug) continue;
		const key = `${entry.seriesSlug}:${entry.seriesOrder}`;
		if (seenSeriesOrders.has(key)) {
			fail(
				`Series order conflict for ${entry.seriesSlug} #${entry.seriesOrder}: ${seenSeriesOrders.get(key)} and ${entry.title}.`,
			);
		}
		seenSeriesOrders.set(key, entry.title);
	}
}

if (failures.length > 0) {
	console.error('CMS verification failed:');
	for (const message of failures) {
		console.error(`- ${message}`);
	}
	process.exit(1);
}

console.log('CMS verification passed: topics, series, references, and series order are valid.');
