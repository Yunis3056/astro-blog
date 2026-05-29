import {validatePreviewUrl} from '@sanity/preview-url-secret';
import {sanityClient} from 'sanity:client';

export const PREVIEW_COOKIE = 'sanity-preview';
export const PREVIEW_COOKIE_VALUE = 'enabled';

type CookieReader = {
	get(name: string): {value?: string} | undefined;
};

export function hasPreviewSession(cookies: CookieReader) {
	return cookies.get(PREVIEW_COOKIE)?.value === PREVIEW_COOKIE_VALUE;
}

export function isAllowedPreviewSecret(requestUrl: URL) {
	const configuredSecret = import.meta.env.SANITY_PREVIEW_SECRET;
	if (!configuredSecret) return !import.meta.env.PROD;

	const providedSecret = requestUrl.searchParams.get('secret')
		|| requestUrl.searchParams.get('previewSecret')
		|| requestUrl.searchParams.get('sanity-preview-secret');

	return providedSecret === configuredSecret;
}

export async function validatePreviewRequest(requestUrl: URL) {
	const manualRedirect = safeRedirectPath(
		requestUrl.searchParams.get('preview') || requestUrl.searchParams.get('redirect'),
		'/',
	);

	if (isAllowedPreviewSecret(requestUrl)) {
		return {isValid: true, redirectTo: manualRedirect};
	}

	if (!requestUrl.searchParams.has('sanity-preview-secret')) {
		return {isValid: false, redirectTo: '/'};
	}

	try {
		const result = await validatePreviewUrl(sanityClient, requestUrl.toString());
		return {
			isValid: result.isValid,
			redirectTo: safeRedirectPath(result.redirectTo, manualRedirect),
		};
	} catch {
		return {isValid: false, redirectTo: '/'};
	}
}

export function previewCookieOptions() {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: import.meta.env.PROD,
		maxAge: 60 * 60 * 8,
	};
}

export function safeRedirectPath(value: string | null | undefined, fallback = '/') {
	const rawPath = value?.trim();
	if (!rawPath) return fallback;
	if (!rawPath.startsWith('/') || rawPath.startsWith('//')) return fallback;
	if (/[\u0000-\u001F\u007F\\]/.test(rawPath)) return fallback;

	try {
		const url = new URL(rawPath, 'https://preview.local');
		if (url.origin !== 'https://preview.local') return fallback;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}
