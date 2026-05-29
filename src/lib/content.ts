import type {PortableTextBlock} from '@portabletext/types';
import {SITE_DESCRIPTION, SITE_TITLE} from '../consts';
import {assertSanityConfig, hasSanityConfig, sanityDataset, sanityProjectId} from './sanity/config';
import {loadQuery} from './sanity/load-query';
import {portableTextToPlainText} from './sanity/portable-text';

export type ContentKind = 'blog' | 'notes' | 'projects';
export type StructureKind = 'topics' | 'series';

export interface SanityImage {
	_type?: 'image';
	asset?: {
		_ref?: string;
		_id?: string;
		url?: string;
		metadata?: {
			lqip?: string;
			dimensions?: {
				width?: number;
				height?: number;
			};
		};
	};
	alt?: string;
	caption?: string;
	crop?: unknown;
	hotspot?: unknown;
}

export interface TopicEntry {
	_id: string;
	collection: 'topics';
	id: string;
	data: {
		title: string;
		description: string;
		order: number;
		featured: boolean;
	};
}

export interface SeriesEntry {
	_id: string;
	collection: 'series';
	id: string;
	data: {
		title: string;
		description: string;
		order: number;
		featured: boolean;
	};
}

export interface BlogEntry {
	_id: string;
	collection: 'blog';
	id: string;
	data: {
		title: string;
		description: string;
		pubDate: Date;
		updatedDate?: Date;
		heroImage?: SanityImage;
		tags: string[];
		topics: string[];
		topicEntries: TopicEntry[];
		series?: {slug: string; order: number};
		seriesEntry?: SeriesEntry | null;
		featured: boolean;
		canonicalURL?: string;
		body: PortableTextBlock[];
		bodyText: string;
	};
}

export interface NoteEntry {
	_id: string;
	collection: 'notes';
	id: string;
	data: {
		title: string;
		description: string;
		pubDate: Date;
		updatedDate?: Date;
		tags: string[];
		topics: string[];
		topicEntries: TopicEntry[];
		series?: {slug: string; order: number};
		seriesEntry?: SeriesEntry | null;
		featured: boolean;
		canonicalURL?: string;
		body: PortableTextBlock[];
		bodyText: string;
	};
}

export type ProjectStatus = 'active' | 'planned' | 'idle' | 'done';

export interface ProjectEntry {
	_id: string;
	collection: 'projects';
	id: string;
	data: {
		title: string;
		description: string;
		status: ProjectStatus;
		stack: string[];
		order: number;
		repoUrl: string;
		demoUrl: string;
		topics: string[];
		topicEntries: TopicEntry[];
		featured: boolean;
		body: PortableTextBlock[];
		bodyText: string;
	};
}

export type SearchableEntry = BlogEntry | NoteEntry | ProjectEntry;
export type TimedEntry = BlogEntry | NoteEntry;

export interface SiteSettings {
	title: string;
	description: string;
	defaultOgImage?: SanityImage;
}

type QueryOptions = {
	draftMode?: boolean;
};

type SanityQueryOptions = Parameters<typeof loadQuery>[0];

let sanitySetupIssue = '';

export const typeLabels: Record<ContentKind, string> = {
	blog: '文章',
	notes: '笔记',
	projects: '项目',
};

const topicProjection = `
	_id,
	"collection": "topics",
	"id": slug.current,
	title,
	description,
	"order": coalesce(order, 999),
	"featured": coalesce(featured, false)
`;

const seriesProjection = `
	_id,
	"collection": "series",
	"id": slug.current,
	title,
	description,
	"order": coalesce(order, 999),
	"featured": coalesce(featured, false)
`;

const contentProjection = `
	_id,
	"id": slug.current,
	title,
	description,
	"featured": coalesce(featured, false),
	"topics": coalesce(topics[]->slug.current, []),
	"topicEntries": coalesce(topics[]->{${topicProjection}}, []),
	"series": select(defined(series.series->slug.current) => {
		"slug": series.series->slug.current,
		"order": series.order
	}, null),
	"seriesEntry": series.series->{${seriesProjection}},
	body
`;

const postProjection = `
	${contentProjection},
	"collection": "blog",
	pubDate,
	updatedDate,
	heroImage{
		...,
		asset->{_id, url, metadata{lqip, dimensions}}
	},
	"tags": coalesce(tags, []),
	canonicalURL
`;

const noteProjection = `
	${contentProjection},
	"collection": "notes",
	pubDate,
	updatedDate,
	"tags": coalesce(tags, []),
	canonicalURL
`;

const projectProjection = `
	${contentProjection},
	"collection": "projects",
	"status": coalesce(status, "active"),
	"stack": coalesce(stack, []),
	"order": coalesce(order, 999),
	"repoUrl": coalesce(repoUrl, ""),
	"demoUrl": coalesce(demoUrl, "")
`;

const siteSettingsProjection = `
	title,
	description,
	defaultOgImage{
		...,
		asset->{_id, url, metadata{lqip, dimensions}}
	}
`;

function toDate(value: string | Date | undefined) {
	return value ? new Date(value) : undefined;
}

function textOrFallback(value: unknown, fallback: string) {
	return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeTopic(raw: any): TopicEntry {
	return {
		_id: raw._id,
		collection: 'topics',
		id: raw.id,
		data: {
			title: raw.title,
			description: raw.description,
			order: raw.order ?? 999,
			featured: Boolean(raw.featured),
		},
	};
}

function normalizeSeries(raw: any): SeriesEntry {
	return {
		_id: raw._id,
		collection: 'series',
		id: raw.id,
		data: {
			title: raw.title,
			description: raw.description,
			order: raw.order ?? 999,
			featured: Boolean(raw.featured),
		},
	};
}

function normalizeTopics(rawTopics: any[] = []) {
	return rawTopics.filter((topic) => topic?.id).map(normalizeTopic);
}

function normalizeSeriesEntry(raw: any): SeriesEntry | null {
	return raw?.id ? normalizeSeries(raw) : null;
}

function normalizeBody(raw: any) {
	return Array.isArray(raw) ? raw : [];
}

function normalizePost(raw: any): BlogEntry {
	const body = normalizeBody(raw.body);
	return {
		_id: raw._id,
		collection: 'blog',
		id: raw.id,
		data: {
			title: raw.title,
			description: raw.description,
			pubDate: toDate(raw.pubDate) ?? new Date(),
			updatedDate: toDate(raw.updatedDate),
			heroImage: raw.heroImage,
			tags: raw.tags ?? [],
			topics: raw.topics ?? [],
			topicEntries: normalizeTopics(raw.topicEntries),
			series: raw.series ?? undefined,
			seriesEntry: normalizeSeriesEntry(raw.seriesEntry),
			featured: Boolean(raw.featured),
			canonicalURL: raw.canonicalURL || undefined,
			body,
			bodyText: portableTextToPlainText(body),
		},
	};
}

function normalizeNote(raw: any): NoteEntry {
	const body = normalizeBody(raw.body);
	return {
		_id: raw._id,
		collection: 'notes',
		id: raw.id,
		data: {
			title: raw.title,
			description: raw.description,
			pubDate: toDate(raw.pubDate) ?? new Date(),
			updatedDate: toDate(raw.updatedDate),
			tags: raw.tags ?? [],
			topics: raw.topics ?? [],
			topicEntries: normalizeTopics(raw.topicEntries),
			series: raw.series ?? undefined,
			seriesEntry: normalizeSeriesEntry(raw.seriesEntry),
			featured: Boolean(raw.featured),
			canonicalURL: raw.canonicalURL || undefined,
			body,
			bodyText: portableTextToPlainText(body),
		},
	};
}

function normalizeProject(raw: any): ProjectEntry {
	const body = normalizeBody(raw.body);
	return {
		_id: raw._id,
		collection: 'projects',
		id: raw.id,
		data: {
			title: raw.title,
			description: raw.description,
			status: raw.status ?? 'active',
			stack: raw.stack ?? [],
			order: raw.order ?? 999,
			repoUrl: raw.repoUrl ?? '',
			demoUrl: raw.demoUrl ?? '',
			topics: raw.topics ?? [],
			topicEntries: normalizeTopics(raw.topicEntries),
			featured: Boolean(raw.featured),
			body,
			bodyText: portableTextToPlainText(body),
		},
	};
}

function normalizeSiteSettings(raw: any): SiteSettings {
	return {
		title: textOrFallback(raw?.title, SITE_TITLE),
		description: textOrFallback(raw?.description, SITE_DESCRIPTION),
		defaultOgImage: raw?.defaultOgImage,
	};
}

function publicFilter(options: QueryOptions) {
	return options.draftMode ? 'defined(slug.current)' : 'defined(slug.current) && !(_id in path("drafts.**"))';
}

function siteSettingsFilter(options: QueryOptions) {
	return options.draftMode ? '_type == "siteSettings"' : '_type == "siteSettings" && !(_id in path("drafts.**"))';
}

function canQuerySanity() {
	if (hasSanityConfig()) return true;
	if (import.meta.env.PROD) assertSanityConfig();
	return false;
}

function describeSanityError(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	if (/Dataset not found/i.test(message)) {
		return `Sanity 项目 ${sanityProjectId} 中没有 ${sanityDataset} dataset。请在 Sanity 的 Datasets 页面创建 ${sanityDataset}。`;
	}
	return message;
}

function handleSanityError(error: unknown) {
	if (import.meta.env.PROD) throw error;
	sanitySetupIssue = describeSanityError(error);
	console.warn(`[Sanity] ${sanitySetupIssue}`);
}

async function loadMany<T>(options: SanityQueryOptions) {
	if (!canQuerySanity()) return [];
	try {
		const result = await loadQuery<T[]>(options);
		sanitySetupIssue = '';
		return result;
	} catch (error) {
		handleSanityError(error);
		return [];
	}
}

async function loadOne<T>(options: SanityQueryOptions) {
	if (!canQuerySanity()) return null;
	try {
		const result = await loadQuery<T | null>(options);
		sanitySetupIssue = '';
		return result;
	} catch (error) {
		handleSanityError(error);
		return null;
	}
}

export function getSanitySetupIssue() {
	if (!hasSanityConfig()) {
		return '本地 Sanity 尚未配置。设置 PUBLIC_SANITY_PROJECT_ID 和 PUBLIC_SANITY_DATASET 后即可读取后台内容。';
	}
	return sanitySetupIssue;
}

export function dateValue(entry: TimedEntry) {
	return entry.data.pubDate.valueOf();
}

export function sortByDateDesc<T extends TimedEntry>(items: T[]) {
	return [...items].sort((a, b) => dateValue(b) - dateValue(a));
}

export function hrefForEntry(entry: SearchableEntry) {
	return `/${entry.collection}/${entry.id}/`;
}

export function labelForEntry(entry: SearchableEntry) {
	return typeLabels[entry.collection];
}

export function topicsForEntry(entry: SearchableEntry) {
	return entry.data.topics ?? [];
}

export function tagsForEntry(entry: SearchableEntry) {
	return 'tags' in entry.data ? entry.data.tags ?? [] : [];
}

export function seriesForEntry(entry: SearchableEntry) {
	return 'series' in entry.data ? entry.data.series : undefined;
}

export function sortMixedEntries(entries: SearchableEntry[]) {
	return [...entries].sort((a, b) => {
		const aDate = 'pubDate' in a.data ? a.data.pubDate.valueOf() : 0;
		const bDate = 'pubDate' in b.data ? b.data.pubDate.valueOf() : 0;
		if (aDate !== bDate) return bDate - aDate;
		const aOrder = 'order' in a.data ? a.data.order : 999;
		const bOrder = 'order' in b.data ? b.data.order : 999;
		return aOrder - bOrder || a.data.title.localeCompare(b.data.title, 'zh-CN');
	});
}

export async function getSiteSettings(options: QueryOptions = {}) {
	const settings = await loadOne<any>({
		query: `*[${siteSettingsFilter(options)}][0]{${siteSettingsProjection}}`,
		draftMode: options.draftMode,
		tag: 'content.site-settings',
	});
	return normalizeSiteSettings(settings);
}

export async function getPublicBlogPosts(options: QueryOptions = {}) {
	const posts = await loadMany<any>({
		query: `*[_type == "post" && ${publicFilter(options)}] | order(pubDate desc){${postProjection}}`,
		draftMode: options.draftMode,
		tag: 'content.posts',
	});
	return posts.filter((post) => post.id).map(normalizePost);
}

export async function getPublicNotes(options: QueryOptions = {}) {
	const notes = await loadMany<any>({
		query: `*[_type == "note" && ${publicFilter(options)}] | order(pubDate desc){${noteProjection}}`,
		draftMode: options.draftMode,
		tag: 'content.notes',
	});
	return notes.filter((note) => note.id).map(normalizeNote);
}

export async function getPublicProjects(options: QueryOptions = {}) {
	const projects = await loadMany<any>({
		query: `*[_type == "project" && ${publicFilter(options)}] | order(order asc, title asc){${projectProjection}}`,
		draftMode: options.draftMode,
		tag: 'content.projects',
	});
	return projects.filter((project) => project.id).map(normalizeProject);
}

export async function getPublicTopics(options: QueryOptions = {}) {
	const topics = await loadMany<any>({
		query: `*[_type == "topic" && ${publicFilter(options)}] | order(order asc, title asc){${topicProjection}}`,
		draftMode: options.draftMode,
		tag: 'content.topics',
	});
	return topics.filter((topic) => topic.id).map(normalizeTopic);
}

export async function getPublicSeries(options: QueryOptions = {}) {
	const series = await loadMany<any>({
		query: `*[_type == "series" && ${publicFilter(options)}] | order(order asc, title asc){${seriesProjection}}`,
		draftMode: options.draftMode,
		tag: 'content.series',
	});
	return series.filter((item) => item.id).map(normalizeSeries);
}

export async function getBlogPostBySlug(slug: string, options: QueryOptions = {}) {
	const post = await loadOne<any>({
		query: `*[_type == "post" && slug.current == $slug && ${publicFilter(options)}][0]{${postProjection}}`,
		params: {slug},
		draftMode: options.draftMode,
		tag: 'content.post',
	});
	return post?.id ? normalizePost(post) : null;
}

export async function getNoteBySlug(slug: string, options: QueryOptions = {}) {
	const note = await loadOne<any>({
		query: `*[_type == "note" && slug.current == $slug && ${publicFilter(options)}][0]{${noteProjection}}`,
		params: {slug},
		draftMode: options.draftMode,
		tag: 'content.note',
	});
	return note?.id ? normalizeNote(note) : null;
}

export async function getProjectBySlug(slug: string, options: QueryOptions = {}) {
	const project = await loadOne<any>({
		query: `*[_type == "project" && slug.current == $slug && ${publicFilter(options)}][0]{${projectProjection}}`,
		params: {slug},
		draftMode: options.draftMode,
		tag: 'content.project',
	});
	return project?.id ? normalizeProject(project) : null;
}

export async function getTopicBySlug(slug: string, options: QueryOptions = {}) {
	const topic = await loadOne<any>({
		query: `*[_type == "topic" && slug.current == $slug && ${publicFilter(options)}][0]{${topicProjection}}`,
		params: {slug},
		draftMode: options.draftMode,
		tag: 'content.topic',
	});
	return topic?.id ? normalizeTopic(topic) : null;
}

export async function getSeriesBySlug(slug: string, options: QueryOptions = {}) {
	const series = await loadOne<any>({
		query: `*[_type == "series" && slug.current == $slug && ${publicFilter(options)}][0]{${seriesProjection}}`,
		params: {slug},
		draftMode: options.draftMode,
		tag: 'content.series-one',
	});
	return series?.id ? normalizeSeries(series) : null;
}

export async function getSearchableEntries(options: QueryOptions = {}) {
	const [blog, notes, projects] = await Promise.all([
		getPublicBlogPosts(options),
		getPublicNotes(options),
		getPublicProjects(options),
	]);
	return sortMixedEntries([...blog, ...notes, ...projects]);
}

export async function getTopicMap(options: QueryOptions = {}) {
	const topics = await getPublicTopics(options);
	return new Map(topics.map((topic) => [topic.id, topic]));
}

export async function getSeriesMap(options: QueryOptions = {}) {
	const series = await getPublicSeries(options);
	return new Map(series.map((item) => [item.id, item]));
}

export function entriesForTopic(entries: SearchableEntry[], topicSlug: string) {
	return sortMixedEntries(entries.filter((entry) => topicsForEntry(entry).includes(topicSlug)));
}

export function entriesForSeries(entries: SearchableEntry[], seriesSlug: string) {
	return entries
		.filter((entry) => seriesForEntry(entry)?.slug === seriesSlug)
		.sort((a, b) => (seriesForEntry(a)?.order ?? 999) - (seriesForEntry(b)?.order ?? 999));
}

export function relatedPostsFor(current: BlogEntry, candidates: BlogEntry[], limit = 3) {
	const currentSeries = current.data.series?.slug;
	const currentTopics = new Set(current.data.topics ?? []);
	const currentTags = new Set(current.data.tags ?? []);

	return candidates
		.filter((post) => post.id !== current.id)
		.map((post) => {
			const seriesScore = currentSeries && post.data.series?.slug === currentSeries ? 100 : 0;
			const topicScore = (post.data.topics ?? []).filter((topic) => currentTopics.has(topic)).length * 12;
			const tagScore = (post.data.tags ?? []).filter((tag) => currentTags.has(tag)).length * 4;
			return {
				post,
				score: seriesScore + topicScore + tagScore,
				date: post.data.pubDate.valueOf(),
			};
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || b.date - a.date)
		.slice(0, limit)
		.map((item) => item.post);
}

export function topicUsage(entries: SearchableEntry[]) {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		for (const topic of topicsForEntry(entry)) {
			counts.set(topic, (counts.get(topic) ?? 0) + 1);
		}
	}
	return counts;
}

export function tagUsage(posts: BlogEntry[]) {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags ?? []) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return counts;
}
