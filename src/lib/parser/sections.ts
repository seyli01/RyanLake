import type { RawBlock, RawEntry, RawSection } from './blocks';
import { splitInline, trimInline } from './inline';
import type {
	EducationEntry,
	ExperienceEntry,
	GenericBlock,
	GenericEntry,
	InlineContent,
	ProjectEntry,
	ResumeSection,
	SectionKind,
	SkillCategory
} from './types';
import type { Warn } from './warnings';

/**
 * Second pass: gives meaning to each raw section according to its H2 title.
 */

type KnownKind = Exclude<SectionKind, 'generic'>;

/** Compared after lowercasing and stripping accents. */
const SECTION_ALIASES: Record<KnownKind, readonly string[]> = {
	education: ['education', 'formation', 'formations', 'etudes'],
	experience: ['experience', 'experiences', 'work experience', 'professional experience', 'experience professionnelle'],
	projects: ['projects', 'personal projects', 'projets', 'projets personnels'],
	skills: ['technical skills', 'skills', 'competences', 'competences techniques']
};

function normalizeTitle(title: string): string {
	return title.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function detectSectionKind(title: string): SectionKind {
	const normalized = normalizeTitle(title);
	for (const [kind, aliases] of Object.entries(SECTION_ALIASES) as [KnownKind, readonly string[]][]) {
		if (aliases.includes(normalized)) return kind;
	}
	return 'generic';
}

// ---------------------------------------------------------------------------
// Helpers shared by all entry kinds
// ---------------------------------------------------------------------------

const SEPARATOR = '|';

function joinSegments(segments: InlineContent[], separator: string): InlineContent {
	return segments.flatMap((segment, i) =>
		i === 0 ? segment : [{ type: 'text', value: separator } as const, ...segment]
	);
}

/** `left | right`. Extra segments are kept in `right` so no text is lost. */
function splitPair(content: InlineContent): [InlineContent, InlineContent] {
	const [left = [], ...rest] = splitInline(content, SEPARATOR);
	return [left, joinSegments(rest, ` ${SEPARATOR} `)];
}

/**
 * The italic second row of an entry. Accepts either `left | right` on one
 * line, or left and right on two consecutive lines (the Education format).
 */
function readSubtitle(entry: RawEntry, warn: Warn): [InlineContent, InlineContent] {
	const [first = [], second, ...extra] = entry.lines;
	let result: [InlineContent, InlineContent];
	let ignored: InlineContent[];

	if (splitInline(first, SEPARATOR).length > 1) {
		result = splitPair(first);
		ignored = entry.lines.slice(1);
	} else {
		result = [first, second ?? []];
		ignored = extra;
	}

	if (ignored.length > 0) {
		warn(`${ignored.length} ligne(s) en trop sous cette entrée, ignorée(s). Utilisez des puces \`- \`.`, entry.line);
	}
	return result;
}

/** Keeps entries, warns about paragraphs/lists that are not under an H3. */
function entriesOf(section: RawSection, warn: Warn): RawEntry[] {
	return section.blocks.filter((block): block is RawEntry => {
		if (block.type === 'entry') return true;
		warn(`Contenu hors entrée dans « ${section.title} » ignoré : ajoutez un titre \`### …\`.`, block.line);
		return false;
	});
}

// ---------------------------------------------------------------------------
// Per-section interpreters
// ---------------------------------------------------------------------------

function toEducation(entry: RawEntry, warn: Warn): EducationEntry {
	const [institution, location] = splitPair(entry.heading);
	const [degree, dates] = readSubtitle(entry, warn);
	return { institution, location, degree, dates, bullets: entry.bullets };
}

function toExperience(entry: RawEntry, warn: Warn): ExperienceEntry {
	const [title, dates] = splitPair(entry.heading);
	const [organization, location] = readSubtitle(entry, warn);
	return { title, dates, organization, location, bullets: entry.bullets };
}

/**
 * `Name`, `Name | Right` or `Name | Detail | Right`: the last segment always
 * goes to the right (dates), anything in between is the italic detail (stack).
 */
function splitHeading(heading: InlineContent): { left: InlineContent; detail: InlineContent; right: InlineContent } {
	const segments = splitInline(heading, SEPARATOR);
	return {
		left: segments[0] ?? [],
		detail: joinSegments(segments.slice(1, -1), ', '),
		right: segments.length > 1 ? segments[segments.length - 1] : []
	};
}

function toProject(entry: RawEntry, warn: Warn): ProjectEntry {
	const { left: name, detail: technologies, right: dates } = splitHeading(entry.heading);
	if (entry.lines.length > 0) {
		warn('Texte sous un projet ignoré : utilisez des puces `- `.', entry.line);
	}
	return { name, technologies, dates, bullets: entry.bullets };
}

/** Removes a leading `:` (and surrounding spaces) from an inline run. */
function stripLeadingColon(content: InlineContent): InlineContent {
	const [first, ...rest] = content;
	if (first?.type !== 'text') return content;
	return trimInline([{ type: 'text', value: first.value.replace(/^\s*:\s*/, '') }, ...rest]);
}

/** Removes a trailing `:` inside `**Languages:**`. */
function stripTrailingColon(content: InlineContent): InlineContent {
	const last = content[content.length - 1];
	if (last?.type !== 'text') return content;
	return trimInline([...content.slice(0, -1), { type: 'text', value: last.value.replace(/\s*:\s*$/, '') }]);
}

function toSkillCategory(line: InlineContent, lineNumber: number | null, warn: Warn): SkillCategory {
	const [first, ...rest] = line;
	if (first?.type === 'strong') {
		return { name: stripTrailingColon(first.children), skills: stripLeadingColon(rest) };
	}

	const [name = [], ...skills] = splitInline(line, ':');
	if (skills.length === 0) {
		warn('Ligne de compétences sans catégorie : attendu `**Catégorie**: …`.', lineNumber);
		return { name: [], skills: name };
	}
	return { name, skills: joinSegments(skills, ': ') };
}

function toSkills(section: RawSection, warn: Warn): SkillCategory[] {
	return section.blocks.flatMap((block: RawBlock) => {
		switch (block.type) {
			case 'paragraph':
				return block.lines.map((line) => toSkillCategory(line, block.line, warn));
			case 'list':
				return block.items.map((item) => toSkillCategory(item, block.line, warn));
			case 'entry':
				warn('Les titres `###` ne sont pas utilisés dans les compétences, ignoré.', block.line);
				return [];
		}
	});
}

/** Same layout as the known sections, inferred from `|` instead of the section title. */
function toGenericEntry(entry: RawEntry): GenericEntry {
	const { left: title, detail, right } = splitHeading(entry.heading);
	const [first = [], ...rest] = entry.lines;
	const hasSubtitle = splitInline(first, SEPARATOR).length > 1;
	const [subtitleLeft, subtitleRight] = splitPair(first);
	return {
		title,
		detail,
		right,
		subtitle: hasSubtitle ? { left: subtitleLeft, right: subtitleRight } : null,
		lines: hasSubtitle ? rest : entry.lines,
		bullets: entry.bullets
	};
}

function toGeneric(section: RawSection): GenericBlock[] {
	return section.blocks.map((block): GenericBlock => {
		switch (block.type) {
			case 'entry':
				return { type: 'entry', ...toGenericEntry(block) };
			case 'paragraph':
				return { type: 'paragraph', lines: block.lines };
			case 'list':
				return { type: 'list', items: block.items };
		}
	});
}

export function interpretSection(section: RawSection, warn: Warn): ResumeSection {
	const { title } = section;
	const kind = detectSectionKind(title);
	switch (kind) {
		case 'education':
			return { kind, title, entries: entriesOf(section, warn).map((e) => toEducation(e, warn)) };
		case 'experience':
			return { kind, title, entries: entriesOf(section, warn).map((e) => toExperience(e, warn)) };
		case 'projects':
			return { kind, title, entries: entriesOf(section, warn).map((e) => toProject(e, warn)) };
		case 'skills':
			return { kind, title, categories: toSkills(section, warn) };
		case 'generic':
			return { kind, title, blocks: toGeneric(section) };
	}
}
