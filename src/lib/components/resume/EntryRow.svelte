<!--
	One line of an entry: text on the left, text flush right.
	HTML/CSS equivalent of `\begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}`.

	Variants mirror the LaTeX macros:
	- title:    `\textbf{#1} & #2`                        (\resumeSubheading, row 1)
	- subtitle: `\textit{\small #3} & \textit{\small #4}` (\resumeSubheading, row 2)
	- project:  `\small \textbf{name} $|$ \emph{stack} & dates` (\resumeProjectHeading)
-->
<svelte:options css="injected" />

<script lang="ts">
	import type { InlineContent } from '$lib/parser';
	import InlineText from './InlineText.svelte';

	let {
		left,
		right,
		detail = [],
		variant
	}: {
		left: InlineContent;
		right: InlineContent;
		/** Italic text after ` | ` on the left (tech stack of a project). */
		detail?: InlineContent;
		variant: 'title' | 'subtitle' | 'project';
	} = $props();
</script>

<div class="row {variant}">
	<span class="left"
		><span class="main"><InlineText content={left} /></span
		>{#if detail.length > 0}&nbsp;|&nbsp;<em><InlineText content={detail} /></em>{/if}</span
	>
	{#if right.length > 0}
		<span class="right"><InlineText content={right} /></span>
	{/if}
</div>

<style>
	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1em;
	}

	.left {
		min-width: 0;
	}

	/* LaTeX tabular columns never wrap: the right cell keeps its width. */
	.right {
		flex-shrink: 0;
		text-align: right;
		white-space: nowrap;
	}

	.title .main,
	.project .main {
		font-weight: 700;
	}

	/* Tabular rows keep the \normalsize strut (13.6pt) even when the cell is \small. */
	.subtitle {
		font-style: italic;
		font-size: var(--resume-small);
	}

	/* Only the left cell of \resumeProjectHeading is \small. */
	.project .left {
		font-size: var(--resume-small);
	}
</style>
