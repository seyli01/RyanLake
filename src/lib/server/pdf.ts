import { env } from '$env/dynamic/private';
import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser } from 'puppeteer-core';
import type { Resume } from '$lib/parser';
import { renderResumeHtml } from './resume-html';

/** Local Chrome used by `pnpm dev`; override with CHROME_PATH. */
const LOCAL_CHROME: Partial<Record<NodeJS.Platform, string>> = {
	linux: '/usr/bin/google-chrome',
	darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
};

async function launchBrowser(): Promise<Browser> {
	if (env.VERCEL) {
		// Serverless: the Chromium build shipped by @sparticuz/chromium.
		chromium.setGraphicsMode = false;
		return puppeteer.launch({
			args: await puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
			executablePath: await chromium.executablePath(),
			headless: 'shell'
		});
	}
	const executablePath = env.CHROME_PATH || LOCAL_CHROME[process.platform];
	if (!executablePath) throw new Error('Chrome introuvable : définissez CHROME_PATH.');
	return puppeteer.launch({ executablePath, headless: true });
}

// Reused while the function instance stays warm: launching Chromium is the slow part.
let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
	browserPromise ??= launchBrowser().then(
		(browser) => {
			browser.on('disconnected', () => (browserPromise = null));
			return browser;
		},
		(error: unknown) => {
			browserPromise = null;
			throw error;
		}
	);
	return browserPromise;
}

export async function renderPdf(resume: Resume): Promise<Uint8Array> {
	const browser = await getBrowser();
	const page = await browser.newPage();
	try {
		await page.setContent(renderResumeHtml(resume), { waitUntil: 'load' });
		await page.evaluate(() => document.fonts.ready.then(() => undefined));
		const margin = '0.5in';
		return await page.pdf({
			format: 'letter',
			margin: { top: margin, right: margin, bottom: margin, left: margin },
			printBackground: true
		});
	} finally {
		await page.close();
	}
}
