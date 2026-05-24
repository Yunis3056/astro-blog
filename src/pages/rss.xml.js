import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const parser = new MarkdownIt({ html: true, linkify: true });

function isMdxBody(body = '', filePath = '') {
	return filePath.endsWith('.mdx')
		|| /^\s*import\s.+from\s+['"].+['"];?/m.test(body)
		|| /<[A-Z][A-Za-z0-9]*(\s|>|\/>)/.test(body);
}

function renderRssContent(post) {
	const body = post.body ?? '';
	const rawHtml = isMdxBody(body, post.filePath ?? '')
		? `<p>${post.data.description}</p>`
		: parser.render(body);

	return sanitizeHtml(rawHtml, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
		allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title'] },
	});
}

async function coverUrl(post, site) {
	if (!post.data.heroImage) return null;
	const image = await getImage({
		src: post.data.heroImage,
		width: 1200,
		height: 630,
		format: 'jpg',
	});
	return new URL(image.src, site).toString();
}

export async function GET(context) {
	const posts = (await getCollection('blog'))
		.filter((p) => !p.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const items = await Promise.all(posts.map(async (post) => {
		const cover = await coverUrl(post, context.site);
		const html = renderRssContent(post);
		return {
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			categories: post.data.tags ?? [],
			content: html,
			customData: cover
				? `<media:content url="${cover}" medium="image" />`
				: undefined,
		};
	}));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: { media: 'http://search.yahoo.com/mrss/' },
		items,
	});
}
