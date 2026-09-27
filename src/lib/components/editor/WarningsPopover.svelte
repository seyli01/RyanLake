<script lang="ts">
	import { CircleAlert, CircleCheck } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { ParseWarning } from '$lib/parser';

	let { warnings }: { warnings: ParseWarning[] } = $props();
</script>

{#if warnings.length === 0}
	<span class="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
		<CircleCheck class="size-3.5" /> Aucun problème
	</span>
{:else}
	<Popover.Root>
		<Popover.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
			<CircleAlert class="size-3.5 text-amber-600 dark:text-amber-400" />
			{warnings.length} avertissement{warnings.length > 1 ? 's' : ''}
		</Popover.Trigger>
		<Popover.Content align="end" class="w-96">
			<ul class="space-y-2 text-sm">
				{#each warnings as warning, i (i)}
					<li class="flex gap-2">
						{#if warning.line !== null}
							<span class="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">L{warning.line}</span>
						{/if}
						<span>{warning.message}</span>
					</li>
				{/each}
			</ul>
		</Popover.Content>
	</Popover.Root>
{/if}
