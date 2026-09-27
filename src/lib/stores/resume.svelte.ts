import { browser } from '$app/environment';
import { DEFAULT_RESUME_MARKDOWN } from '$lib/constants';
import { parseResume, type Resume } from '$lib/parser';

const STORAGE_KEY = 'jakes-resume:markdown';

// localStorage can throw (private mode, quota, blocked site data): never let it break the editor.
function load(): string {
	if (!browser) return DEFAULT_RESUME_MARKDOWN;
	try {
		return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_RESUME_MARKDOWN;
	} catch {
		return DEFAULT_RESUME_MARKDOWN;
	}
}

function save(markdown: string): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, markdown);
	} catch {
		// Not persisted; the in-memory state stays correct.
	}
}

/**
 * Single source of truth: the markdown typed in the editor.
 * The parsed resume is derived from it, so the preview never stores its own copy.
 */
class ResumeStore {
	#markdown = $state(load());

	readonly resume: Resume = $derived(parseResume(this.#markdown));

	get markdown(): string {
		return this.#markdown;
	}

	set markdown(value: string) {
		this.#markdown = value;
		save(value);
	}

	reset(): void {
		this.markdown = DEFAULT_RESUME_MARKDOWN;
	}
}

export const resumeStore = new ResumeStore();
