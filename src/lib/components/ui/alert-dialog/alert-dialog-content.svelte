<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { cn, type WithoutChild, type WithoutChildrenOrChild } from "$lib/utils.js";
	import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
	import AlertDialogPortal from "./alert-dialog-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		size = "default",
		portalProps,
		...restProps
	}: WithoutChild<AlertDialogPrimitive.ContentProps> & {
		size?: "default" | "sm";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof AlertDialogPortal>>;
	} = $props();
</script>

<AlertDialogPortal {...portalProps}>
	<AlertDialogOverlay />
	<AlertDialogPrimitive.Content
		bind:ref
		data-slot="alert-dialog-content"
		data-size={size}
		class={cn(
			"fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl p-6 bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10 outline-none data-[size=default]:max-w-md data-[size=sm]:max-w-sm group/alert-dialog-content data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0 data-open:zoom-in-90 data-closed:zoom-out-90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-90 duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)]",
			className
		)}
		{...restProps}
	/>
</AlertDialogPortal>
