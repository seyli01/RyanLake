import { env } from '$env/dynamic/private';

/**
 * Production origin, read at build time (the site is prerendered):
 * - `SITE_URL` if set (any host, e.g. `https://moncv.dev`);
 * - otherwise Vercel's `VERCEL_PROJECT_PRODUCTION_URL` (custom domain if configured, no protocol);
 * - otherwise `null` (local builds).
 */
function resolveSiteOrigin(): string | null {
	if (env.SITE_URL) return env.SITE_URL.replace(/\/+$/, '');
	if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
	return null;
}

export const SITE_ORIGIN = resolveSiteOrigin();
