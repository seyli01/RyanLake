<!--
	A Letter page laid out like Jake's Resume:
	\documentclass[letterpaper,11pt]{article} + \usepackage[empty]{fullpage}
	+ \addtolength{…}{±0.5in / 1in}  →  0.5in margins, 7.5in text width.
-->
<svelte:options css="injected" />

<script lang="ts">
	import './cmu-serif.css';
	import type { Resume } from '$lib/parser';
	import ResumeHeader from './ResumeHeader.svelte';
	import ResumeSection from './ResumeSection.svelte';

	let { resume }: { resume: Resume } = $props();

	const PAGE_WIDTH_PX = 8.5 * 96;
	/** Space kept around the page inside the preview pane. */
	const GUTTER_PX = 24;

	let availableWidth = $state(PAGE_WIDTH_PX);
	// Shrink the page to fit the pane, never enlarge it past 100%.
	const scale = $derived(Math.min(1, Math.max(0.2, (availableWidth - 2 * GUTTER_PX) / PAGE_WIDTH_PX)));
</script>

<div class="viewport" bind:clientWidth={availableWidth} style:padding="{GUTTER_PX}px">
	<article class="page" style:zoom={scale}>
		<ResumeHeader header={resume.header} />
		{#each resume.sections as section, i (i)}
			<ResumeSection {section} />
		{/each}
	</article>
</div>

<style>
	.viewport {
		display: flex;
		justify-content: center;
	}

	.page {
		/* Geometry */
		--resume-page-width: 8.5in;
		--resume-page-height: 11in;
		--resume-margin: 0.5in;
		--resume-text-width: calc(var(--resume-page-width) - 2 * var(--resume-margin));

		/* LaTeX 11pt article sizes: \normalsize, \small, \large, \Huge, \tiny (size / \baselineskip) */
		--resume-normal: 10.95pt;
		--resume-normal-leading: 13.6pt;
		--resume-small: 10pt;
		--resume-small-leading: 12pt;
		--resume-large: 12pt;
		--resume-large-leading: 14pt;
		--resume-huge: 24.88pt;
		--resume-huge-leading: 30pt;
		--resume-tiny: 6pt;

		/* Vertical rhythm: net result of titlesec/itemize spacing and the template's negative \vspace. */
		--resume-section-before: 12pt;
		--resume-section-after: 8pt;
		--resume-entry-gap: 3pt;
		--resume-bullets-before: 1pt;
		--resume-bullets-after: 3pt;
		/* Level-2 itemize \itemsep in 11pt article. */
		--resume-bullet-gap: 2pt;

		box-sizing: border-box;
		flex-shrink: 0;
		width: var(--resume-page-width);
		min-height: var(--resume-page-height);
		padding: var(--resume-margin);
		background: white;
		color: black;
		box-shadow:
			0 1px 3px rgb(0 0 0 / 0.12),
			0 8px 24px rgb(0 0 0 / 0.08);
		font-family: 'CMU Serif', 'Latin Modern Roman', 'Computer Modern', Georgia, serif;
		font-size: var(--resume-normal);
		line-height: var(--resume-normal-leading);
		text-align: left;
		font-kerning: normal;
		font-feature-settings: 'liga' 1;
	}

	/* PDF export: the page margins move to @page so every printed page gets them. */
	@media print {
		.viewport {
			display: block;
			padding: 0 !important;
		}

		.page {
			width: auto;
			min-height: 0;
			padding: 0;
			box-shadow: none;
			zoom: 1 !important;
		}
	}
</style>
