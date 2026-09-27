<script lang="ts">
	import { RotateCcw } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import ExportPdfButton from '$lib/components/editor/ExportPdfButton.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import WarningsPopover from '$lib/components/editor/WarningsPopover.svelte';
	import ResumePage from '$lib/components/resume/ResumePage.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { absoluteUrl, OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '$lib/site';
	import { resumeStore } from '$lib/stores/resume.svelte';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let resetDialogOpen = $state(false);

	// Side by side on desktop, stacked on small screens.
	const wide = new MediaQuery('min-width: 768px');

	// The prerendered HTML cannot know what is in the visitor's localStorage:
	// everything that depends on the resume is rendered once in the browser.
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const canonicalUrl = $derived(absoluteUrl(data.siteOrigin, '/'));
	const ogImageUrl = $derived(absoluteUrl(data.siteOrigin, OG_IMAGE_PATH));
	const jsonLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		...(canonicalUrl && { url: canonicalUrl }),
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Any',
		inLanguage: 'fr',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }
	}));
</script>

<svelte:head>
	<title>{SITE_TITLE}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
	{#if canonicalUrl}
		<link rel="canonical" href={canonicalUrl} />
		<meta property="og:url" content={canonicalUrl} />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={SITE_TITLE} />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:locale" content="fr_FR" />
	<meta name="twitter:title" content={SITE_TITLE} />
	<meta name="twitter:description" content={SITE_DESCRIPTION} />
	{#if ogImageUrl}
		<meta property="og:image" content={ogImageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={ogImageUrl} />
	{:else}
		<meta name="twitter:card" content="summary" />
	{/if}
	<!-- JSON.stringify output only contains our own constants; `<` is escaped to be safe inside <script>. -->
	{@html `<script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</script>`}
</svelte:head>

<div class="flex h-dvh flex-col">
	<header class="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
		<h1 class="truncate text-sm font-semibold">Markdown → Jake's Resume</h1>

		<div class="flex items-center gap-1">
			{#if mounted}
				<WarningsPopover warnings={resumeStore.resume.warnings} />
				<ExportPdfButton markdown={resumeStore.markdown} fileName={resumeStore.resume.header.name || 'cv'} />

				<AlertDialog.Root bind:open={resetDialogOpen}>
					<AlertDialog.Trigger
						class={cn(
							buttonVariants({ variant: 'ghost', size: 'sm' }),
							"transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
						)}
					>
						<RotateCcw class="size-3.5" /> Réinitialiser
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Réinitialiser le CV ?</AlertDialog.Title>
							<AlertDialog.Description>
								Votre markdown sera remplacé par l'exemple de départ. Cette action est définitive.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel onclick={() => (resetDialogOpen = false)}>Annuler</AlertDialog.Cancel>
							<AlertDialog.Action
								variant="destructive"
								onclick={() => {
									resumeStore.reset();
									resetDialogOpen = false;
								}}
							>
								Réinitialiser
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{/if}
		</div>
	</header>

	{#if !mounted}
		<div class="min-h-0 flex-1 bg-muted" aria-busy="true"></div>
	{:else}
		{#key wide.current}
			<Resizable.PaneGroup
				direction={wide.current ? 'horizontal' : 'vertical'}
				autoSaveId={wide.current ? 'resume-split-h' : 'resume-split-v'}
				class="min-h-0 flex-1"
			>
				<Resizable.Pane defaultSize={42} minSize={20}>
					<MarkdownEditor bind:value={resumeStore.markdown} />
				</Resizable.Pane>
				<Resizable.Handle withHandle />
				<Resizable.Pane defaultSize={58} minSize={20}>
					<ScrollArea class="h-full bg-muted">
						<ResumePage resume={resumeStore.resume} />
					</ScrollArea>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		{/key}
	{/if}
</div>
