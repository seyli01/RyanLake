import type { Config } from '@sveltejs/adapter-vercel';
import { error } from '@sveltejs/kit';
import { parseResume } from '$lib/parser';
import { renderPdf } from '$lib/server/pdf';
import type { RequestHandler } from './$types';

export const prerender = false;

// A cold start unpacks and boots Chromium before rendering.
export const config: Config = { runtime: 'nodejs22.x', maxDuration: 30 };

const MAX_MARKDOWN_LENGTH = 100_000;

export const POST: RequestHandler = async ({ request }) => {
	const body: unknown = await request.json().catch(() => null);
	const markdown = (body as { markdown?: unknown } | null)?.markdown;
	if (typeof markdown !== 'string' || markdown.trim() === '') error(400, 'markdown manquant');
	if (markdown.length > MAX_MARKDOWN_LENGTH) error(413, 'CV trop long');

	let pdf: Uint8Array;
	try {
		// The resume is only processed in memory, never stored.
		pdf = await renderPdf(parseResume(markdown));
	} catch (cause) {
		console.error('[pdf]', cause);
		error(502, 'La génération du PDF a échoué, réessayez.');
	}

	return new Response(pdf as BodyInit, {
		headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' }
	});
};
