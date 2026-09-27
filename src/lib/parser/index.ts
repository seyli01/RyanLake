import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { groupBlocks } from './blocks';
import { interpretSection } from './sections';
import type { Resume } from './types';
import { createWarningCollector } from './warnings';

export type * from './types';
export { detectSectionKind } from './sections';
export { toPlainText } from './inline';

const processor = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']);

/**
 * markdown → mdast (remark) → raw sections → typed Resume.
 * Never throws: malformed input produces a partial Resume plus warnings,
 * which is what a live preview needs while the user is typing.
 */
export function parseResume(markdown: string): Resume {
	const { warnings, warn } = createWarningCollector();
	const { header, sections } = groupBlocks(processor.parse(markdown), warn);
	return {
		header,
		sections: sections.map((section) => interpretSection(section, warn)),
		warnings
	};
}
