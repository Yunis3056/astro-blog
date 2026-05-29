import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import { getPublicBlogPosts, getSiteSettings } from '../lib/content';
import { portableTextToHtml } from '../lib/sanity/portable-text';
import { sanityImageUrl } from '../lib/sanity/image';

export const prerender = true;

function renderRssContent(post) {
	return sanitizeHtml(portableTextToHtml(post.data.body), {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat([
			'img',
			'figure',
			'figcaption',
			'pre',
			'code',
			'table',
			'tbody',
			'tr',
			'th',
			'td',
		]),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			a: ['href', 'target', 'rel'],
			img: ['src', 'alt', 'title', 'loading', 'decoding'],
			code: ['class'],
		},
	});
}

function coverUrl(post) {
	if (!post.data.heroImage) return null;
	return sanityImageUrl(post.data.heroImage, {width: 1200, height: 630, quality: 82});
}

function xmlAttribute(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

export async function GET(context) {
	const [posts, settings] = await Promise.all([getPublicBlogPosts(), getSiteSettings()]);
	const items = posts.map((post) => {
		const cover = coverUrl(post);
		return {
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			categories: post.data.tags ?? [],
			content: renderRssContent(post),
			customData: cover ? `<media:content url="${xmlAttribute(cover)}" medium="image" />` : undefined,
		};
	});

	return rss({
		title: settings.title,
		description: settings.description,
		site: context.site,
		xmlns: { media: 'http://search.yahoo.com/mrss/' },
		items,
	});
}
