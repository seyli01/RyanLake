<script lang="ts">
	import { FileDown, LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { markdown, fileName }: { markdown: string; fileName: string } = $props();

	let pending = $state(false);
	let failure = $state<string | null>(null);

	/** Characters that are invalid in file names on Windows/macOS/Linux. */
	const safeFileName = $derived(fileName.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'CV');

	async function exportPdf() {
		pending = true;
		failure = null;
		try {
			const response = await fetch('/api/pdf', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ markdown })
			});
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.message ?? `Erreur ${response.status}`);
			}

			// Saved wherever the browser puts downloads (usually the Downloads folder).
			const link = document.createElement('a');
			link.href = URL.createObjectURL(await response.blob());
			link.download = `${safeFileName}.pdf`;
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (error) {
			failure = (error as Error).message;
		} finally {
			pending = false;
		}
	}
</script>

{#if failure}
	<span class="max-w-56 truncate text-xs text-destructive" title={failure}>{failure}</span>
{/if}
<Button
	variant="ghost"
	size="sm"
	disabled={pending}
	onclick={exportPdf}
	title="Le CV est envoyé au serveur le temps de générer le PDF, puis oublié."
>
	{#if pending}
		<LoaderCircle class="size-3.5 animate-spin" />
	{:else}
		<FileDown class="size-3.5" />
	{/if}
	Exporter en PDF
</Button>
