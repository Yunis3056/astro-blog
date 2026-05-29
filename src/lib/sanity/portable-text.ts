import {escapeHTML, toHTML, uriLooksSafe} from '@portabletext/to-html';
import type {PortableTextBlock} from '@portabletext/types';
import {sanityImageAlt, sanityImageUrl} from './image';

export interface Heading {
	depth: number;
	slug: string;
	text: string;
}

function childrenText(block: PortableTextBlock) {
	return (block.children ?? [])
		.map((child: any) => (child._type === 'span' ? child.text : ''))
		.join('')
		.trim();
}

function slugify(value: string) {
	const base = value
		.trim()
		.toLowerCase()
		.replace(/[`~!@#$%^&*()+=[\]{}\\|;:'",.<>/?，。！？；：“”‘’（）【】《》]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

	return base || 'section';
}

export function headingsFromPortableText(blocks: PortableTextBlock[] = []): Heading[] {
	const seen = new Map<string, number>();

	return blocks
		.filter((block) => block._type === 'block' && ['h2', 'h3'].includes(String(block.style)))
		.map((block) => {
			const text = childrenText(block);
			const base = slugify(text);
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			return {
				depth: block.style === 'h3' ? 3 : 2,
				slug: count === 0 ? base : `${base}-${count + 1}`,
				text,
			};
		});
}

export function portableTextToPlainText(blocks: PortableTextBlock[] = []) {
	return blocks
		.map((block: any) => {
			if (block._type === 'block') return childrenText(block);
			if (block._type === 'code') return block.code ?? '';
			if (block._type === 'table') {
				return (block.rows ?? []).map((row: any) => (row.cells ?? []).join(' ')).join(' ');
			}
			return '';
		})
		.filter(Boolean)
		.join('\n\n');
}

export function portableTextToHtml(blocks: PortableTextBlock[] = []) {
	const headings = headingsFromPortableText(blocks);
	let headingIndex = 0;

	return toHTML(blocks, {
		components: {
			block: {
				normal: ({children}) => `<p>${children}</p>`,
				h2: ({children}) => {
					const id = headings[headingIndex++]?.slug ?? slugify(String(children));
					return `<h2 id="${escapeHTML(id)}">${children}</h2>`;
				},
				h3: ({children}) => {
					const id = headings[headingIndex++]?.slug ?? slugify(String(children));
					return `<h3 id="${escapeHTML(id)}">${children}</h3>`;
				},
				h4: ({children}) => `<h4>${children}</h4>`,
				blockquote: ({children}) => `<blockquote>${children}</blockquote>`,
			},
			marks: {
				link: ({children, value}) => {
					const href = String(value?.href || '');
					if (!uriLooksSafe(href)) return children;
					const target = value?.blank ? ' target="_blank"' : '';
					const rel = value?.blank ? ' rel="noreferrer noopener"' : '';
					return `<a href="${escapeHTML(href)}"${target}${rel}>${children}</a>`;
				},
			},
			types: {
				image: ({value}) => {
					const src = sanityImageUrl(value, {width: 1400, quality: 82});
					if (!src) return '';
					const alt = escapeHTML(sanityImageAlt(value));
					const caption = typeof value?.caption === 'string' ? value.caption.trim() : '';
					return `<figure><img src="${escapeHTML(src)}" alt="${alt}" loading="lazy" decoding="async" />${caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ''}</figure>`;
				},
				code: ({value}) => {
					const code = escapeHTML(String(value?.code ?? ''));
					const language = escapeHTML(String(value?.language ?? 'text'));
					const filename = typeof value?.filename === 'string' && value.filename.trim()
						? `<figcaption>${escapeHTML(value.filename)}</figcaption>`
						: '';
					return `<figure class="code-block">${filename}<pre><code class="language-${language}">${code}</code></pre></figure>`;
				},
				table: ({value}) => {
					const rows = Array.isArray(value?.rows) ? value.rows : [];
					if (rows.length === 0) return '';
					return `<div class="table-scroll"><table>${rows.map((row: any, index: number) => {
						const tag = index === 0 ? 'th' : 'td';
						const cells = Array.isArray(row?.cells) ? row.cells : [];
						return `<tr>${cells.map((cell: string) => `<${tag}>${escapeHTML(String(cell ?? ''))}</${tag}>`).join('')}</tr>`;
					}).join('')}</table></div>`;
				},
			},
			unknownType: ({value}) => {
				throw new Error(`Unsupported Portable Text block type: ${value?._type ?? 'unknown'}`);
			},
		},
	});
}
