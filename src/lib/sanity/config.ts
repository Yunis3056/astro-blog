export const sanityApiVersion = import.meta.env.SANITY_API_VERSION || '2025-02-19';
export const sanityProjectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || import.meta.env.SANITY_STUDIO_PROJECT_ID;
export const sanityDataset = import.meta.env.PUBLIC_SANITY_DATASET || import.meta.env.SANITY_STUDIO_DATASET || 'production-blog';
export const missingSanityConfigMessage =
	'Sanity is not configured. Set PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET before building the public site.';

export function hasSanityConfig() {
	return Boolean(sanityProjectId && sanityDataset);
}

export function assertSanityConfig() {
	if (!hasSanityConfig()) {
		throw new Error(missingSanityConfigMessage);
	}
}
