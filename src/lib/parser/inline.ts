import type { PhrasingContent } from 'mdast';
import type { Inline, InlineContent } from './types';

/**
 * LaTeX input ligatures, so that `Aug. 2018 -- May 2021` renders with an
 * en dash exactly like in the .tex template. Order matters (`---` first).
 */
function applyTypography(value: string): string {
	return value.replace(/---/g, '—').replace(/--/g, '–');
}

/**
 * Converts mdast phrasing nodes to our inline AST.
 * Soft and hard line breaks both become `\n` so callers can split on lines.
 */
export function toInline(nodes: PhrasingContent[]): InlineContent {
	const out: InlineContent = [];
	for (const node of nodes) {
		switch (node.type) {
			case 'text':
				out.push({ type: 'text', value: applyTypography(node.value) });
				break;
			case 'break':
				out.push({ type: 'text', value: '\n' });
				break;
			case 'strong':
				out.push({ type: 'strong', children: toInline(node.children) });
				break;
			case 'emphasis':
				out.push({ type: 'emphasis', children: toInline(node.children) });
				break;
			case 'inlineCode':
				out.push({ type: 'code', value: node.value });
				break;
			case 'link':
				out.push({ type: 'link', url: node.url, children: toInline(node.children) });
				break;
			default:
				// Images, raw HTML, unresolved references…: keep their text only.
				if ('children' in node) out.push(...toInline(node.children as PhrasingContent[]));
				else if ('value' in node) out.push({ type: 'text', value: node.value });
		}
	}
	return out;
}

/** Removes leading/trailing whitespace at the edges of an inline run. */
export function trimInline(content: InlineContent): InlineContent {
	const out = [...content];
	const first = out[0];
	if (first?.type === 'text') out[0] = { type: 'text', value: first.value.trimStart() };
	const lastIndex = out.length - 1;
	const last = out[lastIndex];
	if (last?.type === 'text') out[lastIndex] = { type: 'text', value: last.value.trimEnd() };
	return out.filter((node) => node.type !== 'text' || node.value !== '');
}

/**
 * Splits an inline run on a separator found in top-level text nodes.
 * Separators inside bold, links or code are left untouched, so
 * `[a|b](url) | Paris` splits into two segments, not three.
 * Each segment is trimmed.
 */
export function splitInline(content: InlineContent, separator: string): InlineContent[] {
	const segments: InlineContent[] = [[]];
	for (const node of content) {
		if (node.type !== 'text') {
			segments[segments.length - 1].push(node);
			continue;
		}
		node.value.split(separator).forEach((part, i) => {
			if (i > 0) segments.push([]);
			if (part !== '') segments[segments.length - 1].push({ type: 'text', value: part });
		});
	}
	return segments.map(trimInline);
}

/** Splits a paragraph into its source lines, dropping blank ones. */
export function splitLines(content: InlineContent): InlineContent[] {
	return splitInline(content, '\n').filter((line) => line.length > 0);
}

export function toPlainText(content: InlineContent): string {
	return content
		.map((node: Inline) => ('children' in node ? toPlainText(node.children) : node.value))
		.join('');
}
