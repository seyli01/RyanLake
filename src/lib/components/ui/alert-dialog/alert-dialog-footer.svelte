<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-footer"
	class={cn(
		"flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-2",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
