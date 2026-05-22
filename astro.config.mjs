// @ts-check

import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://yunis3056.github.io',
	integrations: [
		expressiveCode({
			themes: ['github-light', 'github-dark'],
			themeCssSelector: (theme) => theme.name === 'github-dark' ? '[data-theme="dark"]' : '[data-theme="light"]',
			useDarkModeMediaQuery: true,
			styleOverrides: {
				borderRadius: '12px',
				codeFontFamily: 'var(--font-mono)',
				frames: { shadowColor: 'transparent' },
			},
			defaultProps: { wrap: true },
		}),
		mdx(),
		sitemap(),
	],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
										},
				],
			},
		},
	],
});
