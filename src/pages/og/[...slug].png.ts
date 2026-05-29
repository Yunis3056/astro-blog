import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getPublicBlogPosts, getSiteSettings, type BlogEntry } from '../../lib/content';

export const prerender = true;

const fontData = await fs.readFile(
	path.join(process.cwd(), 'node_modules/noto-fontface-cjk-jp/fonts/Noto/NotoSansCJKjp-Regular.otf'),
);

export async function getStaticPaths() {
	const [posts, settings] = await Promise.all([getPublicBlogPosts(), getSiteSettings()]);
	return posts.map((post) => ({ params: { slug: post.id }, props: {post, siteTitle: settings.title} }));
}

export const GET: APIRoute = async ({ props }) => {
	const {post, siteTitle} = props as {post: BlogEntry; siteTitle: string};
	const { title, description, pubDate } = post.data;
	const dateStr = new Date(pubDate).toISOString().slice(0, 10);

	return new ImageResponse(
		{
			type: 'div',
			props: {
				style: {
					width: '100%', height: '100%',
					display: 'flex', flexDirection: 'column',
					background: '#faf9f6',
					padding: '70px 80px',
					fontFamily: 'Noto Sans CJK',
					position: 'relative',
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute', top: 0, left: 0, right: 0,
								height: 6, background: '#da5629',
							},
						},
					},
					{
						type: 'div',
						props: {
							style: {
								display: 'flex', alignItems: 'center', gap: 12,
								fontSize: 24, color: '#82807a', letterSpacing: 2,
							},
							children: [
								{ type: 'div', props: { style: { width: 12, height: 12, borderRadius: 999, background: '#da5629' } } },
								{ type: 'div', props: { children: siteTitle } },
							],
						},
					},
					{
						type: 'div',
						props: {
							style: { marginTop: 'auto', display: 'flex', flexDirection: 'column' },
							children: [
								{
									type: 'div',
									props: {
										style: {
											fontSize: 64, lineHeight: 1.15, color: '#111',
											fontWeight: 600, letterSpacing: 0, marginBottom: 24,
											display: 'flex',
										},
										children: title,
									},
								},
								{
									type: 'div',
									props: {
										style: { fontSize: 26, color: '#3c3c3c', lineHeight: 1.5, display: 'flex' },
										children: (description || '').slice(0, 80),
									},
								},
							],
						},
					},
					{
						type: 'div',
						props: {
							style: {
								marginTop: 30, paddingTop: 20,
								borderTop: '1px solid #e6e2db',
								fontSize: 22, color: '#82807a', letterSpacing: 1,
								display: 'flex', justifyContent: 'space-between',
							},
							children: [
								{ type: 'div', props: { children: dateStr } },
								{ type: 'div', props: { children: 'yunis3056.github.io' } },
							],
						},
					},
				],
			},
		} as any,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Noto Sans CJK',
					data: fontData,
					weight: 400 as const,
					style: 'normal' as const,
				},
			],
		}
	);
};
