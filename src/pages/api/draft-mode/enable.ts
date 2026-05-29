import type {APIRoute} from 'astro';
import {
	PREVIEW_COOKIE,
	PREVIEW_COOKIE_VALUE,
	previewCookieOptions,
	validatePreviewRequest,
} from '../../../lib/preview';

export const prerender = false;

export const GET: APIRoute = async ({cookies, redirect, request}) => {
	const requestUrl = new URL(request.url);
	const validation = await validatePreviewRequest(requestUrl);
	if (!validation.isValid) {
		return new Response('Invalid preview secret.', {status: 401});
	}

	cookies.set(PREVIEW_COOKIE, PREVIEW_COOKIE_VALUE, previewCookieOptions());

	return redirect(validation.redirectTo);
};
