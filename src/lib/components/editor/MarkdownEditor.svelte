<script lang="ts">
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
	import { markdown } from '@codemirror/lang-markdown';
	import { yamlFrontmatter } from '@codemirror/lang-yaml';
	import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { EditorState } from '@codemirror/state';
	import {
		drawSelection,
		EditorView,
		highlightActiveLine,
		highlightActiveLineGutter,
		keymap,
		lineNumbers
	} from '@codemirror/view';
	import { tags as t } from '@lezer/highlight';
	import { onMount } from 'svelte';

	let { value = $bindable() }: { value: string } = $props();

	let container: HTMLDivElement;
	let view: EditorView | undefined;

	const highlightStyle = HighlightStyle.define([
		{ tag: t.heading2, fontWeight: '700', color: 'var(--editor-heading)' },
		{ tag: [t.heading1, t.heading3, t.heading4], fontWeight: '700' },
		{ tag: t.strong, fontWeight: '700' },
		{ tag: t.emphasis, fontStyle: 'italic' },
		{ tag: [t.link, t.url], color: 'var(--editor-link)' },
		{ tag: t.processingInstruction, color: 'var(--muted-foreground)' },
		{ tag: [t.propertyName, t.definition(t.propertyName)], color: 'var(--editor-key)' },
		{ tag: t.monospace, color: 'var(--editor-key)' },
		{ tag: t.meta, color: 'var(--muted-foreground)' }
	]);

	const theme = EditorView.theme({
		'&': { height: '100%', fontSize: '13px', backgroundColor: 'var(--background)', color: 'var(--foreground)' },
		'&.cm-focused': { outline: 'none' },
		'.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.6' },
		'.cm-content': { padding: '12px 0', caretColor: 'var(--foreground)' },
		'.cm-line': { padding: '0 16px 0 8px' },
		'.cm-gutters': {
			backgroundColor: 'var(--background)',
			color: 'var(--muted-foreground)',
			border: 'none'
		},
		'.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'color-mix(in oklch, var(--muted) 70%, transparent)' },
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
			backgroundColor: 'color-mix(in oklch, var(--editor-link) 25%, transparent) !important'
		}
	});

	onMount(() => {
		view = new EditorView({
			parent: container,
			state: EditorState.create({
				doc: value,
				extensions: [
					lineNumbers(),
					highlightActiveLine(),
					highlightActiveLineGutter(),
					drawSelection(),
					history(),
					keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
					EditorView.lineWrapping,
					yamlFrontmatter({ content: markdown() }),
					syntaxHighlighting(highlightStyle),
					theme,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) value = update.state.doc.toString();
					})
				]
			})
		});
		return () => view?.destroy();
	});

	// External changes (e.g. "reset") must be pushed into the editor.
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
		}
	});
</script>

<div class="editor h-full" bind:this={container}></div>

<style>
	.editor {
		--editor-heading: oklch(0.5 0.15 260);
		--editor-link: oklch(0.55 0.15 250);
		--editor-key: oklch(0.55 0.14 160);
	}

	:global(.dark) .editor {
		--editor-heading: oklch(0.75 0.12 260);
		--editor-link: oklch(0.75 0.12 250);
		--editor-key: oklch(0.75 0.12 160);
	}
</style>
