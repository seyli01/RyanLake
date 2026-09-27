// The whole site is static HTML generated at build time, so crawlers and link
// previews get real content. The editor itself only mounts in the browser
// (see +page.svelte) because the resume lives in localStorage.
export const prerender = true;
