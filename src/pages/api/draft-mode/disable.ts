import type {APIRoute} from 'astro';
import {PREVIEW_COOKIE, safeRedirectPath} from '../../../lib/preview';

export const prerender = false;

export const GET: APIRoute = async ({cookies, redirect, request}) => {
	const requestUrl = new URL(request.url);
	cookies.delete(PREVIEW_COOKIE, {path: '/'});
	return redirect(safeRedirectPath(requestUrl.searchParams.get('redirect'), '/'));
};
