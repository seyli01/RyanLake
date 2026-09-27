import { render } from 'svelte/server';
import ResumePage from '$lib/components/resume/ResumePage.svelte';
import boldItalic from '$lib/components/resume/fonts/cmu-serif-700-italic.woff2?inline';
import bold from '$lib/components/resume/fonts/cmu-serif-700-roman.woff2?inline';
import italic from '$lib/components/resume/fonts/cmu-serif-500-italic.woff2?inline';
import roman from '$lib/components/resume/fonts/cmu-serif-500-roman.woff2?inline';
import type { Resume } from '$lib/parser';

/**
 * Self-contained HTML document for the headless browser: fonts are inlined as
 * data URLs, so rendering never depends on fetching anything over the network.
 * Same faces as cmu-serif.css, which the app uses.
 */
const FONT_FACES = (
	[
		[roman, 'normal', 400],
		[italic, 'italic', 400],
		[bold, 'normal', 700],
		[boldItalic, 'italic', 700]
	] as const
)
	.map(
		([src, style, weight]) =>
			`@font-face{font-family:'CMU Serif';font-style:${style};font-weight:${weight};src:url(${src}) format('woff2')}`
	)
	.join('');

function escapeHtml(value: string): string {
	return value.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function renderResumeHtml(resume: Resume): string {
	const { head, body } = render(ResumePage, { props: { resume } });
	const title = escapeHtml(resume.header.name || 'CV');
	return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><style>${FONT_FACES}html,body{margin:0;background:#fff}</style>${head}</head><body>${body}</body></html>`;
}
