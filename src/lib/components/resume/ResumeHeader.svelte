<!--
	\begin{center}
	  \textbf{\Huge \scshape Name} \\ \vspace{1pt}
	  \small phone $|$ \href{mailto:…}{\underline{email}} $|$ …
	\end{center}
-->
<svelte:options css="injected" />

<script lang="ts">
	import type { ResumeHeader } from '$lib/parser';

	let { header }: { header: ResumeHeader } = $props();
</script>

<header>
	{#if header.name}
		<h1>{header.name}</h1>
	{/if}
	{#if header.contacts.length > 0}
		<p>
			{#each header.contacts as contact, i (contact.key)}{#if i > 0}&nbsp;|&nbsp;{/if}{#if contact.href}<a
						href={contact.href}
						target="_blank"
						rel="noopener noreferrer">{contact.label}</a
					>{:else}{contact.label}{/if}{/each}
		</p>
	{/if}
</header>

<style>
	header {
		text-align: center;
	}

	h1 {
		margin: 0 0 1pt;
		font-size: var(--resume-huge);
		line-height: var(--resume-huge-leading);
		font-weight: 700;
		font-variant: small-caps;
	}

	p {
		margin: 0;
		font-size: var(--resume-small);
		line-height: var(--resume-small-leading);
	}

	a {
		color: inherit;
		text-decoration: underline;
		text-decoration-thickness: 0.4pt;
		text-underline-offset: 1.5pt;
	}
</style>
