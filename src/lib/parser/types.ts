/**
 * Typed resume AST.
 *
 * This is the only contract between the parser and the Svelte renderer:
 * components never see mdast, and the parser never knows about HTML/CSS.
 */

// ---------------------------------------------------------------------------
// Inline content
// ---------------------------------------------------------------------------

/** Minimal inline formatting kept from the markdown (bold, italic, links…). */
export type Inline =
	| { type: 'text'; value: string }
	| { type: 'strong'; children: InlineContent }
	| { type: 'emphasis'; children: InlineContent }
	| { type: 'code'; value: string }
	| { type: 'link'; url: string; children: InlineContent };

/** A run of inline nodes. An empty array means "field absent". */
export type InlineContent = Inline[];

// ---------------------------------------------------------------------------
// Header (front-matter)
// ---------------------------------------------------------------------------

export interface ContactItem {
	/** Front-matter key, e.g. `email`, `linkedin`. */
	key: string;
	/** Text displayed in the contact line. */
	label: string;
	/** `mailto:` / `https://` target, or `null` when not a link (phone…). */
	href: string | null;
}

export interface ResumeHeader {
	name: string;
	/** In front-matter order, `name` excluded. */
	contacts: ContactItem[];
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

/** `### Institution | Location` + degree line + dates line. */
export interface EducationEntry {
	institution: InlineContent;
	location: InlineContent;
	degree: InlineContent;
	dates: InlineContent;
	bullets: InlineContent[];
}

/** `### Title | Dates` + `Organization | Location` line. */
export interface ExperienceEntry {
	title: InlineContent;
	dates: InlineContent;
	organization: InlineContent;
	location: InlineContent;
	bullets: InlineContent[];
}

/** `### Name | Technologies | Dates`. */
export interface ProjectEntry {
	name: InlineContent;
	technologies: InlineContent;
	dates: InlineContent;
	bullets: InlineContent[];
}

/** `**Category**: items`. */
export interface SkillCategory {
	name: InlineContent;
	skills: InlineContent;
}

/**
 * `### …` in a section whose title is not recognised: its layout is inferred
 * from the `|` separators instead of the section name.
 */
export interface GenericEntry {
	/** `### Title | Right`, or `### Title | Detail | Right` like a project. */
	title: InlineContent;
	detail: InlineContent;
	right: InlineContent;
	/** First line under the heading, when it contains a `|` (italic row). */
	subtitle: { left: InlineContent; right: InlineContent } | null;
	lines: InlineContent[];
	bullets: InlineContent[];
}

/** Content of a section whose title is not recognised. */
export type GenericBlock =
	| ({ type: 'entry' } & GenericEntry)
	| { type: 'paragraph'; lines: InlineContent[] }
	| { type: 'list'; items: InlineContent[] };

// ---------------------------------------------------------------------------
// Sections & document
// ---------------------------------------------------------------------------

export type ResumeSection =
	| { kind: 'education'; title: string; entries: EducationEntry[] }
	| { kind: 'experience'; title: string; entries: ExperienceEntry[] }
	| { kind: 'projects'; title: string; entries: ProjectEntry[] }
	| { kind: 'skills'; title: string; categories: SkillCategory[] }
	| { kind: 'generic'; title: string; blocks: GenericBlock[] };

export type SectionKind = ResumeSection['kind'];

/** Non-fatal problem in the source; the parser always returns a Resume. */
export interface ParseWarning {
	message: string;
	/** 1-based line in the markdown source (front-matter included). */
	line: number | null;
}

export interface Resume {
	header: ResumeHeader;
	sections: ResumeSection[];
	warnings: ParseWarning[];
}
