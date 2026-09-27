import type { List, Root } from 'mdast';
import { splitLines, toInline, toPlainText } from './inline';
import { parseFrontmatter } from './frontmatter';
import type { InlineContent, ResumeHeader } from './types';
import { lineOf, type Warn } from './warnings';

/**
 * First pass: groups the flat mdast into H2 sections and H3 entries,
 * without interpreting what each section means. That is done in sections.ts.
 */

export interface RawEntry {
	type: 'entry';
	/** H3 content, not yet split on `|`. */
	heading: InlineContent;
	/** Paragraph lines following the H3 (one per source line). */
	lines: InlineContent[];
	bullets: InlineContent[];
	line: number | null;
}

export type RawBlock =
	| RawEntry
	| { type: 'paragraph'; lines: InlineContent[]; line: number | null }
	| { type: 'list'; items: InlineContent[]; line: number | null };

export interface RawSection {
	title: string;
	blocks: RawBlock[];
	line: number | null;
}

export interface RawDocument {
	header: ResumeHeader;
	sections: RawSection[];
}

function joinLines(lines: InlineContent[]): InlineContent {
	return lines.flatMap((line, i) => (i === 0 ? line : [{ type: 'text', value: ' ' } as const, ...line]));
}

/** One inline run per bullet; nested lists are flattened (Jake's template has one level). */
function listItems(list: List): InlineContent[] {
	return list.children.flatMap((item) => {
		const lines: InlineContent[] = [];
		const nested: InlineContent[] = [];
		for (const child of item.children) {
			if (child.type === 'paragraph') lines.push(...splitLines(toInline(child.children)));
			else if (child.type === 'list') nested.push(...listItems(child));
		}
		// A bullet wrapped over several source lines is a single line of text.
		return lines.length > 0 ? [joinLines(lines), ...nested] : nested;
	});
}

export function groupBlocks(root: Root, warn: Warn): RawDocument {
	let header: ResumeHeader = { name: '', contacts: [] };
	let h1Name: string | null = null;
	const sections: RawSection[] = [];
	let section: RawSection | null = null;
	let entry: RawEntry | null = null;

	const orphan = (line: number | null) =>
		warn('Contenu ignoré : il doit se trouver sous un titre de section `## …`.', line);

	for (const node of root.children) {
		const line = lineOf(node);
		switch (node.type) {
			case 'yaml':
				header = parseFrontmatter(node.value, line, warn);
				break;

			case 'heading': {
				const content = toInline(node.children);
				if (node.depth === 1) {
					h1Name = toPlainText(content).trim();
				} else if (node.depth === 2) {
					section = { title: toPlainText(content).trim(), blocks: [], line };
					sections.push(section);
					entry = null;
				} else if (section) {
					entry = { type: 'entry', heading: content, lines: [], bullets: [], line };
					section.blocks.push(entry);
				} else {
					orphan(line);
				}
				break;
			}

			case 'paragraph': {
				const lines = splitLines(toInline(node.children));
				// Text after an entry's bullets closes the entry, so it keeps its place below them.
				if (entry && entry.bullets.length === 0) entry.lines.push(...lines);
				else if (section) {
					section.blocks.push({ type: 'paragraph', lines, line });
					entry = null;
				} else orphan(line);
				break;
			}

			case 'list': {
				const items = listItems(node);
				if (entry) entry.bullets.push(...items);
				else if (section) section.blocks.push({ type: 'list', items, line });
				else orphan(line);
				break;
			}

			case 'definition':
				// Link reference definitions carry no visible content.
				break;

			default:
				warn(`Bloc \`${node.type}\` non supporté, ignoré.`, line);
		}
	}

	// `# Name` is accepted as a fallback when the front-matter has no name.
	if (!header.name && h1Name) header = { ...header, name: h1Name };

	return { header, sections };
}
