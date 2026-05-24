import { getCollection, type CollectionEntry } from 'astro:content';

export type ContentKind = 'blog' | 'notes' | 'projects';
export type SearchableEntry =
	| CollectionEntry<'blog'>
	| CollectionEntry<'notes'>
	| CollectionEntry<'projects'>;
export type TimedEntry = CollectionEntry<'blog'> | CollectionEntry<'notes'>;

export const typeLabels: Record<ContentKind, string> = {
	blog: '文章',
	notes: '笔记',
	projects: '项目',
};

export function isPublic<T extends { data: { draft?: boolean } }>(entry: T) {
	return !entry.data.draft;
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
	return typeLabels[entry.collection as ContentKind];
}

export function topicsForEntry(entry: SearchableEntry) {
	return 'topics' in entry.data ? entry.data.topics ?? [] : [];
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

export async function getPublicBlogPosts() {
	return sortByDateDesc((await getCollection('blog')).filter(isPublic));
}

export async function getPublicNotes() {
	return sortByDateDesc((await getCollection('notes')).filter(isPublic));
}

export async function getPublicProjects() {
	return (await getCollection('projects'))
		.filter(isPublic)
		.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'zh-CN'));
}

export async function getPublicTopics() {
	return (await getCollection('topics'))
		.filter(isPublic)
		.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'zh-CN'));
}

export async function getPublicSeries() {
	return (await getCollection('series'))
		.filter(isPublic)
		.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'zh-CN'));
}

export async function getSearchableEntries() {
	const [blog, notes, projects] = await Promise.all([
		getPublicBlogPosts(),
		getPublicNotes(),
		getPublicProjects(),
	]);
	return sortMixedEntries([...blog, ...notes, ...projects]);
}

export async function getTopicMap() {
	const topics = await getPublicTopics();
	return new Map(topics.map((topic) => [topic.id, topic]));
}

export async function getSeriesMap() {
	const series = await getPublicSeries();
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

export function relatedPostsFor(
	current: CollectionEntry<'blog'>,
	candidates: CollectionEntry<'blog'>[],
	limit = 3,
) {
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
