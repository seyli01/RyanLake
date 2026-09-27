<!--
	\titleformat{\section}{\vspace{-4pt}\scshape\raggedright\large}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]
	followed by the section body.
-->
<svelte:options css="injected" />

<script lang="ts">
	import type { InlineContent, ResumeSection } from '$lib/parser';
	import BulletList from './BulletList.svelte';
	import EntryRow from './EntryRow.svelte';
	import InlineText from './InlineText.svelte';

	let { section }: { section: ResumeSection } = $props();
</script>

{#snippet lines(items: InlineContent[])}
	{#if items.length > 0}
		<div class="lines">
			{#each items as line, i (i)}
				<div><InlineText content={line} /></div>
			{/each}
		</div>
	{/if}
{/snippet}

<section>
	<h2>{section.title}</h2>

	<!-- \resumeSubHeadingListStart = itemize[leftmargin=0.15in, label={}] -->
	<div class="body">
		{#if section.kind === 'education'}
			{#each section.entries as entry, i (i)}
				<div class="entry">
					<EntryRow variant="title" left={entry.institution} right={entry.location} />
					<EntryRow variant="subtitle" left={entry.degree} right={entry.dates} />
					<BulletList items={entry.bullets} />
				</div>
			{/each}
		{:else if section.kind === 'experience'}
			{#each section.entries as entry, i (i)}
				<div class="entry">
					<EntryRow variant="title" left={entry.title} right={entry.dates} />
					<EntryRow variant="subtitle" left={entry.organization} right={entry.location} />
					<BulletList items={entry.bullets} />
				</div>
			{/each}
		{:else if section.kind === 'projects'}
			{#each section.entries as entry, i (i)}
				<div class="entry">
					<EntryRow variant="project" left={entry.name} detail={entry.technologies} right={entry.dates} />
					<BulletList items={entry.bullets} />
				</div>
			{/each}
		{:else if section.kind === 'skills'}
			<div class="lines">
				{#each section.categories as category, i (i)}
					<div>
						{#if category.name.length > 0}<strong><InlineText content={category.name} /></strong>{': '}{/if}<InlineText
							content={category.skills}
						/>
					</div>
				{/each}
			</div>
		{:else}
			{#each section.blocks as block, i (i)}
				{#if block.type === 'entry'}
					<div class="entry">
						<EntryRow
							variant={block.detail.length > 0 ? 'project' : 'title'}
							left={block.title}
							detail={block.detail}
							right={block.right}
						/>
						{#if block.subtitle}
							<EntryRow variant="subtitle" left={block.subtitle.left} right={block.subtitle.right} />
						{/if}
						{@render lines(block.lines)}
						<BulletList items={block.bullets} />
					</div>
				{:else if block.type === 'paragraph'}
					{@render lines(block.lines)}
				{:else}
					<BulletList items={block.items} />
				{/if}
			{/each}
		{/if}
	</div>
</section>

<style>
	section {
		margin-top: var(--resume-section-before);
	}

	h2 {
		margin: 0 0 var(--resume-section-after);
		font-size: var(--resume-large);
		line-height: var(--resume-large-leading);
		font-weight: 400;
		font-variant: small-caps;
		/* \titlerule: 0.4pt */
		border-bottom: 0.4pt solid currentColor;
		/* Never leave a section title alone at the bottom of a page. */
		break-after: avoid;
	}

	.body {
		padding-left: 0.15in;
		/* The tabular is 0.97\textwidth wide, so it stops short of the rule. */
		padding-right: calc(0.03 * var(--resume-text-width) - 0.15in);
	}

	/* Never split an entry across two pages. */
	.entry {
		break-inside: avoid;
	}

	.entry + .entry {
		margin-top: var(--resume-entry-gap);
	}

	/* \small{\item{ \textbf{Languages}{: …} \\ … }}, also used for free text lines. */
	.lines {
		font-size: var(--resume-small);
		line-height: var(--resume-small-leading);
	}
</style>
