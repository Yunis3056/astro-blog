import type {QueryParams} from 'sanity';
import {sanityClient} from 'sanity:client';
import {assertSanityConfig} from './config';

type LoadQueryOptions = {
	query: string;
	params?: QueryParams;
	draftMode?: boolean;
	tag?: string;
};

export async function loadQuery<QueryResponse>({
	query,
	params = {},
	draftMode = false,
	tag,
}: LoadQueryOptions): Promise<QueryResponse> {
	assertSanityConfig();

	const token = import.meta.env.SANITY_API_READ_TOKEN;

	if (draftMode && !token) {
		throw new Error('SANITY_API_READ_TOKEN is required for draft preview and visual editing.');
	}

	if (draftMode) {
		const {result} = await sanityClient.fetch<QueryResponse>(query, params, {
			filterResponse: false,
			perspective: 'drafts',
			resultSourceMap: 'withKeyArraySelector',
			stega: true,
			token,
			useCdn: false,
			tag,
		});

		return result;
	}

	return sanityClient.fetch<QueryResponse>(query, params, {
		perspective: 'published',
		useCdn: true,
		tag,
	});
}
