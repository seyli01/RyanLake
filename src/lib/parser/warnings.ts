import type { Node } from 'mdast';
import type { ParseWarning } from './types';

export type Warn = (message: string, line: number | null) => void;

export function lineOf(node: Node): number | null {
	return node.position?.start.line ?? null;
}

export function createWarningCollector(): { warnings: ParseWarning[]; warn: Warn } {
	const warnings: ParseWarning[] = [];
	return { warnings, warn: (message, line) => warnings.push({ message, line }) };
}
