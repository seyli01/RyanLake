import { parse as parseYaml } from 'yaml';
import type { ContactItem, ResumeHeader } from './types';
import type { Warn } from './warnings';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\//i;
/** Bare domain with optional path: `github.com/ryanlake`. */
const DOMAIN_RE = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/;

function toContact(key: string, raw: unknown): ContactItem | null {
	if (raw === null || raw === undefined || typeof raw === 'object') return null;
	const value = String(raw).trim();
	if (value === '') return null;

	if (EMAIL_RE.test(value)) return { key, label: value, href: `mailto:${value}` };
	if (URL_RE.test(value)) return { key, label: value.replace(URL_RE, ''), href: value };
	if (DOMAIN_RE.test(value)) return { key, label: value, href: `https://${value}` };
	// Phone numbers and free text are displayed but not clickable, as in the .tex.
	return { key, label: value, href: null };
}

export function parseFrontmatter(source: string, line: number | null, warn: Warn): ResumeHeader {
	let data: unknown;
	try {
		data = parseYaml(source);
	} catch (error) {
		warn(`Front-matter YAML invalide : ${(error as Error).message.split('\n')[0]}`, line);
		return { name: '', contacts: [] };
	}

	if (data === null || typeof data !== 'object' || Array.isArray(data)) {
		warn('Le front-matter doit être une liste de clés `clé: valeur`.', line);
		return { name: '', contacts: [] };
	}

	const { name, ...rest } = data as Record<string, unknown>;
	const contacts: ContactItem[] = [];
	for (const [key, value] of Object.entries(rest)) {
		const contact = toContact(key, value);
		if (contact) contacts.push(contact);
		else warn(`Champ de front-matter \`${key}\` ignoré (valeur vide ou non textuelle).`, line);
	}

	return { name: name === undefined || name === null ? '' : String(name).trim(), contacts };
}
