<!-- \resumeItemListStart … \resumeItem{…} … \resumeItemListEnd -->
<svelte:options css="injected" />

<script lang="ts">
	import type { InlineContent } from '$lib/parser';
	import InlineText from './InlineText.svelte';

	let { items }: { items: InlineContent[] } = $props();
</script>

{#if items.length > 0}
	<ul>
		{#each items as item, i (i)}
			<li><InlineText content={item} /></li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		margin: var(--resume-bullets-before) 0 var(--resume-bullets-after);
		/* Second-level itemize: \leftmarginii = 2.2em of the 11pt font. */
		padding-left: 24pt;
		font-size: var(--resume-small);
		line-height: var(--resume-small-leading);
	}

	li {
		position: relative;
		margin-bottom: var(--resume-bullet-gap);
	}

	/* \labelitemii = $\vcenter{\hbox{\tiny$\bullet$}}$, set \labelsep (0.5em) left of the text. */
	li::before {
		content: '\2022';
		position: absolute;
		right: calc(100% + 5.5pt);
		height: var(--resume-small-leading);
		display: flex;
		align-items: center;
		font-size: var(--resume-tiny);
	}
</style>
