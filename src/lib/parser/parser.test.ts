import { describe, expect, it } from 'vitest';
import { DEFAULT_RESUME_MARKDOWN } from '$lib/constants';
import { parseResume, toPlainText, type InlineContent, type ResumeSection } from './index';

const text = (content: InlineContent) => toPlainText(content);

function section<K extends ResumeSection['kind']>(md: string, kind: K) {
	const found = parseResume(md).sections.find((s) => s.kind === kind);
	if (!found) throw new Error(`no ${kind} section`);
	return found as Extract<ResumeSection, { kind: K }>;
}

describe('default resume', () => {
	const resume = parseResume(DEFAULT_RESUME_MARKDOWN);

	it('parses without warnings', () => {
		expect(resume.warnings).toEqual([]);
	});

	it('reads the header', () => {
		expect(resume.header).toEqual({
			name: 'Ryan Lake',
			contacts: [
				{ key: 'phone', label: '123-456-7890', href: null },
				{ key: 'email', label: 'ryan@su.edu', href: 'mailto:ryan@su.edu' },
				{ key: 'linkedin', label: 'linkedin.com/in/ryanlake', href: 'https://linkedin.com/in/ryanlake' },
				{ key: 'github', label: 'github.com/ryanlake', href: 'https://github.com/ryanlake' }
			]
		});
	});

	it('detects the four sections in order', () => {
		expect(resume.sections.map((s) => s.kind)).toEqual(['education', 'experience', 'projects', 'skills']);
	});

	it('reads education entries', () => {
		const [first] = section(DEFAULT_RESUME_MARKDOWN, 'education').entries;
		expect(text(first.institution)).toBe('Southwestern University');
		expect(text(first.location)).toBe('Georgetown, TX');
		expect(text(first.degree)).toBe('Bachelor of Arts in Computer Science, Minor in Business');
		expect(text(first.dates)).toBe('Aug. 2018 – May 2021');
	});

	it('reads experience entries', () => {
		const [first] = section(DEFAULT_RESUME_MARKDOWN, 'experience').entries;
		expect(text(first.title)).toBe('Undergraduate Research Assistant');
		expect(text(first.dates)).toBe('June 2020 – Present');
		expect(text(first.organization)).toBe('Texas A&M University');
		expect(text(first.location)).toBe('College Station, TX');
		expect(first.bullets).toHaveLength(3);
	});

	it('reads project entries', () => {
		const [first] = section(DEFAULT_RESUME_MARKDOWN, 'projects').entries;
		expect(text(first.name)).toBe('Gitlytics');
		expect(text(first.technologies)).toBe('Python, Flask, React, PostgreSQL, Docker');
		expect(text(first.dates)).toBe('June 2020 – Present');
	});

	it('reads skill categories', () => {
		const { categories } = section(DEFAULT_RESUME_MARKDOWN, 'skills');
		expect(categories.map((c) => [text(c.name), text(c.skills)])).toEqual([
			['Languages', 'Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R'],
			['Frameworks', 'React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI'],
			['Developer Tools', 'Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse'],
			['Libraries', 'pandas, NumPy, Matplotlib']
		]);
	});
});

describe('edge cases', () => {
	it('does not split on `|` inside links', () => {
		const md = '## Projects\n### [A|B](https://x.dev) | TS | 2024\n- x';
		const [entry] = section(md, 'projects').entries;
		expect(entry.name).toEqual([{ type: 'link', url: 'https://x.dev', children: [{ type: 'text', value: 'A|B' }] }]);
		expect(text(entry.dates)).toBe('2024');
	});

	it('accepts `degree | dates` on a single line', () => {
		const [entry] = section('## Education\n### Uni | Paris\nMaster | 2020 -- 2022', 'education').entries;
		expect(text(entry.degree)).toBe('Master');
		expect(text(entry.dates)).toBe('2020 – 2022');
	});

	it('accepts `**Category:**` and list-style skills', () => {
		const { categories } = section('## Skills\n- **Langs:** Go, Rust', 'skills');
		expect(text(categories[0].name)).toBe('Langs');
		expect(text(categories[0].skills)).toBe('Go, Rust');
	});

	it('recognises French section titles', () => {
		expect(parseResume('## Expérience professionnelle\n## Compétences').sections.map((s) => s.kind)).toEqual([
			'experience',
			'skills'
		]);
	});

	it('infers the entry layout of unknown sections from `|`', () => {
		const md = '## Exprience\n### Dev | 2024\nCorp | Paris\nFree text\n- detail\n\nClosing paragraph';
		const [entry, paragraph] = section(md, 'generic').blocks;
		if (entry.type !== 'entry') throw new Error('expected an entry');
		expect([text(entry.title), text(entry.right)]).toEqual(['Dev', '2024']);
		expect(entry.subtitle && [text(entry.subtitle.left), text(entry.subtitle.right)]).toEqual(['Corp', 'Paris']);
		expect(entry.lines.map(text)).toEqual(['Free text']);
		expect(entry.bullets.map(text)).toEqual(['detail']);
		expect(paragraph.type).toBe('paragraph');
	});

	it('uses the project layout for three-segment headings in unknown sections', () => {
		const [entry] = section('## Side work\n### App | TS, Svelte | 2024\nNo pipe here', 'generic').blocks;
		if (entry.type !== 'entry') throw new Error('expected an entry');
		expect([text(entry.title), text(entry.detail), text(entry.right)]).toEqual(['App', 'TS, Svelte', '2024']);
		expect(entry.subtitle).toBeNull();
		expect(entry.lines.map(text)).toEqual(['No pipe here']);
	});

	it('warns instead of throwing on invalid YAML', () => {
		const resume = parseResume('---\nname: [oops\n---\n## Education');
		expect(resume.header.name).toBe('');
		expect(resume.warnings[0].line).toBe(1);
	});

	it('warns about extra lines with their source line number', () => {
		const resume = parseResume('## Experience\n### Dev | 2024\nCorp | Paris\nstray line');
		expect(resume.warnings).toEqual([expect.objectContaining({ line: 2 })]);
	});
});
