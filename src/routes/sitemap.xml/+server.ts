import { SITE_ORIGIN } from '$lib/server/site-origin';
import { absoluteUrl } from '$lib/site';

export const prerender = true;

export function GET(): Response {
	const home = absoluteUrl(SITE_ORIGIN, '/');
	const urls = home ? `\n\t<url><loc>${home}</loc></url>` : '';
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
