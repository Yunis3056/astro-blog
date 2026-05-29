import {createImageUrlBuilder} from '@sanity/image-url';
import {sanityDataset, sanityProjectId} from './config';

const builder = createImageUrlBuilder({
	projectId: sanityProjectId || 'placeholder',
	dataset: sanityDataset,
});

type SanityImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
};

export function sanityImageUrl(source: unknown, options: SanityImageOptions = {}) {
	if (!source) return '';

	let image = builder.image(source as any).auto('format').fit('max');
	if (options.width) image = image.width(options.width);
	if (options.height) image = image.height(options.height);
	if (options.quality) image = image.quality(options.quality);
	return image.url();
}

export function sanityImageAlt(image: any, fallback = '') {
	return typeof image?.alt === 'string' && image.alt.trim() ? image.alt : fallback;
}
