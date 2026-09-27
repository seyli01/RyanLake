<svelte:options css="injected" />

<script lang="ts">
	import type { InlineContent } from '$lib/parser';
	import InlineText from './InlineText.svelte';

	let { content }: { content: InlineContent } = $props();

	// The preview renders user markdown: never turn `javascript:` & co. into a clickable link.
	const SAFE_URL = /^(https?:|mailto:|tel:)/i;
</script>

<!-- Kept on one line per branch: any whitespace between tags would show up as spaces in the CV. -->
{#each content as node, i (i)}{#if node.type === 'text'}{node.value}{:else if node.type === 'strong'}<strong><InlineText content={node.children} /></strong>{:else if node.type === 'emphasis'}<em><InlineText content={node.children} /></em>{:else if node.type === 'code'}<code>{node.value}</code>{:else if SAFE_URL.test(node.url)}<a href={node.url} target="_blank" rel="noopener noreferrer"><InlineText content={node.children} /></a>{:else}<InlineText content={node.children} />{/if}{/each}

<style>
	/* hyperref's `hidelinks`: links look like plain text in the body. */
	a {
		color: inherit;
		text-decoration: none;
	}

	code {
		font-family: 'CMU Typewriter Text', ui-monospace, monospace;
	}
</style>
