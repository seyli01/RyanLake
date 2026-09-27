import { SITE_ORIGIN } from '$lib/server/site-origin';
import { absoluteUrl } from '$lib/site';

export const prerender = true;

export function GET(): Response {
	const sitemap = absoluteUrl(SITE_ORIGIN, '/sitemap.xml');
	const body = ['User-agent: *', 'Allow: /', ...(sitemap ? ['', `Sitemap: ${sitemap}`] : [])].join('\n');
	return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
