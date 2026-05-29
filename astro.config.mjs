// @ts-check

import expressiveCode from 'astro-expressive-code';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sanity from '@sanity/astro';
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
/** @param {string} key */
const envValue = (key) => process.env[key] || env[key];
const projectId = envValue('PUBLIC_SANITY_PROJECT_ID') || envValue('SANITY_STUDIO_PROJECT_ID') || 'placeholder';
const dataset = envValue('PUBLIC_SANITY_DATASET') || envValue('SANITY_STUDIO_DATASET') || 'production-blog';
const apiVersion = envValue('SANITY_API_VERSION') || '2025-02-19';
const site = envValue('PUBLIC_SITE_URL') || 'https://yunis3056.github.io';

// https://astro.build/config
export default defineConfig({
	site,
	output: 'server',
	adapter: vercel(),
	integrations: [
		sanity({
			projectId,
			dataset,
			apiVersion,
			useCdn: true,
			studioBasePath: '/admin',
			stega: {
				studioUrl: '/admin',
			},
		}),
		react(),
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
