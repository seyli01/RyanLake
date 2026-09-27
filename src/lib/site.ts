/**
 * Public site metadata used for SEO tags, the sitemap and robots.txt.
 * The production origin comes from the build environment: see $lib/server/site-origin.ts.
 */

export const SITE_NAME = 'Markdown → Jake’s Resume';
export const SITE_TITLE = 'Éditeur de CV Markdown gratuit – template LaTeX Jake’s Resume';
export const SITE_DESCRIPTION =
	'Écrivez votre CV en Markdown et voyez-le mis en page en direct avec le template LaTeX Jake’s Resume, comme sur Overleaf. Gratuit, sans compte : votre CV est sauvegardé dans votre navigateur.';

/** 1200×630 image in `static/`, shown when the link is shared. */
export const OG_IMAGE_PATH = '/og-image.png';

/**
 * Tags that need an absolute URL (canonical, og:url, og:image, sitemap) are
 * left out when the origin is unknown, rather than pointing at a wrong domain.
 */
export function absoluteUrl(origin: string | null, path: string): string | null {
	return origin ? new URL(path, origin).href : null;
}
