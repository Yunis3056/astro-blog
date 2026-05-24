import { getCollection } from 'astro:content';
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

export async function GET(context) {
	const posts = (await getCollection('blog'))
		.filter((p) => !p.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: { media: 'http://search.yahoo.com/mrss/' },
		items: posts.map((post) => {
			const cover = post.data.heroImage?.src
				? new URL(post.data.heroImage.src, context.site).toString()
				: null;
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
		}),
	});
}
