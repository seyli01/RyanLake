import { SITE_ORIGIN } from '$lib/server/site-origin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({ siteOrigin: SITE_ORIGIN });
