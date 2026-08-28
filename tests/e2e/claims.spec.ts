import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

test('@claim:caption-import opens a local WebVTT file and renders its cues', async ({ page }) => {
  await page.goto('/player');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  await expect(page.getByText('Mariner', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/opened with 2 timed captions/)).toBeVisible();
});

test('@claim:supplied-uncertainty marks only confidence supplied by the source', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#caption-text .uncertain')).toHaveText('platform');
  await expect(page.locator('#caption-text .uncertain')).toHaveAttribute('aria-label', 'platform, uncertain');
  await expect(page.locator('.speaker-chip')).toHaveText('Maya');
  await expect(page.locator('#caption-text .chosen')).toHaveText('fourteen.');
});

test('@claim:local-processing keeps the demo flow on the same origin', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Play' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Pause' }).click();
  expect(outside).toEqual([]);
});

test('@claim:offline-reload opens the demo without a network after first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByText('Sample conversation loaded. Demo changes are not saved.')).toBeVisible();
  await page.waitForFunction(async () => navigator.serviceWorker?.controller !== null && Boolean(await caches.match('/assets/app.js')));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Make each caption easier to follow' })).toBeVisible();
});

test('@claim:keyboard-playback controls playback with Space and arrows', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#time-output')).toContainText('00:05');
});

test('@claim:core-free exposes every caption control without a license', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByLabel('Caption size')).toBeVisible();
  await expect(page.getByLabel('Mark supplied uncertainty')).toBeChecked();
  await expect(page.getByLabel('Show speaker changes')).toBeChecked();
  await expect(page.getByLabel('Chosen terms')).toBeVisible();
});

test('@claim:paid-profiles saves five named setups after license verification', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb_license:caption-salience:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() })));
  await page.goto('/player');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  page.once('dialog', (dialog) => dialog.accept('Station setup'));
  await page.getByRole('button', { name: 'Save this setup' }).click();
  await expect(page.getByRole('button', { name: 'Load Station setup' })).toBeVisible();
  await expect(page.locator('.profile-box')).toContainText('1/5');
});

test('@claim:local-audio adds an audio file without uploading it', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url()); });
  await page.goto('/demo');
  await page.setInputFiles('#audio-file', { name: 'sample.wav', mimeType: 'audio/wav', buffer: Buffer.from('RIFF fixture') });
  await expect(page.locator('#file-status')).toContainText('sample.wav added');
  expect(outside).toEqual([]);
});

test('@claim:microphone-captions shows words and supplied engine confidence', async ({ page }) => {
  await page.addInitScript(() => {
    class FakeRecognition {
      continuous = false; interimResults = false; onresult = (_event: unknown) => {}; onerror = (_event: unknown) => {}; onend = () => {};
      start() { this.onresult({ results: [[{ transcript: 'check platform seven', confidence: .4 }]] }); }
      stop() { this.onend(); }
    }
    (window as any).SpeechRecognition = FakeRecognition;
  });
  await page.goto('/player');
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await expect(page.locator('#caption-text')).toContainText('check platform seven');
  await expect(page.locator('#caption-text .uncertain')).toHaveCount(3);
});

test('@claim:local-preferences keeps display settings in browser storage', async ({ page }) => {
  const fixture = path.join(process.cwd(), 'tests/fixtures/example.vtt');
  await page.goto('/player');
  await page.setInputFiles('#caption-file', fixture);
  await page.getByLabel('Caption size').fill('60');
  await page.reload();
  await page.setInputFiles('#caption-file', fixture);
  await expect(page.getByLabel('Caption size')).toHaveValue('60');
});

test('@claim:demo-memory keeps sample state out of browser storage and discards it on exit', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByLabel('Caption size').fill('60');
  expect(await page.evaluate(() => localStorage.getItem('caption-salience:preferences'))).toBeNull();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/player$/);
  await expect(page.getByRole('heading', { name: 'Your captions will appear here' })).toBeVisible();
  await expect(page.getByLabel('Caption size')).not.toBeVisible();
});

test('@claim:no-hearing-diagnosis states the diagnostic boundary and presents only caption controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('It does not diagnose hearing loss.')).toBeVisible();
  await page.goto('/player');
  await expect(page.getByRole('heading', { name: 'Your captions will appear here' })).toBeVisible();
  await expect(page.getByRole('button', { name: /diagnos/i })).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('No caption file is open');
});

test('@claim:no-caption-extraction states the extraction boundary and limits imports to local caption files', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('It does not extract video or protected captions.')).toBeVisible();
  await page.goto('/player');
  await expect(page.locator('#caption-file')).toHaveAttribute('accept', /\.srt.*\.vtt/);
  await expect(page.getByRole('button', { name: /extract/i })).toHaveCount(0);
});

test('@claim:no-invented-confidence leaves ordinary captions unmarked', async ({ page }) => {
  await page.goto('/player');
  await page.setInputFiles('#caption-file', {
    name: 'ordinary.vtt',
    mimeType: 'text/vtt',
    buffer: Buffer.from('WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nThe train is arriving now.\n')
  });
  await expect(page.locator('#caption-text')).toContainText('The train is arriving now.');
  await expect(page.locator('#caption-text .uncertain')).toHaveCount(0);
});

test('@claim:no-tracking uses no outside requests, cookies, or account controls', async ({ page, context }) => {
  const outside: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/');
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(outside).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  await expect(page.getByRole('button', { name: /account|sign in|log in/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /account|sign in|log in/i })).toHaveCount(0);
});

test('invalid and empty files explain the next step', async ({ page }) => {
  await page.goto('/player');
  await expect(page.getByRole('heading', { name: 'Your captions will appear here' })).toBeVisible();
  await page.setInputFiles('#caption-file', { name: 'broken.vtt', mimeType: 'text/vtt', buffer: Buffer.from('not timed captions') });
  await expect(page.getByRole('status')).toContainText('Choose a valid SRT or WebVTT file');
});

test('pages have no serious accessibility violations', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/install']) {
    await page.goto(route);
    expect(await page.locator('h1').count()).toBe(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  }
});

test('mobile demo keeps controls visible at 390 pixels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/demo');
  await expect(page.getByLabel('Caption size')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mobile persistent controls and navigation meet the 44px touch target requirement', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/demo');
  const demoTargetSizes = await page.locator('#reset-demo, #start-real, .site-header nav a').evaluateAll((elements) =>
    elements.filter((element) => element.getClientRects().length > 0).map((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { text: element.textContent?.trim(), width, height };
    })
  );
  for (const target of demoTargetSizes) {
    expect(target.width, `${target.text} width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `${target.text} height`).toBeGreaterThanOrEqual(44);
  }
  await page.locator('footer').scrollIntoViewIfNeeded();
  const footerTargetSizes = await page.locator('footer nav a').evaluateAll((elements) =>
    elements.map((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { text: element.textContent?.trim(), width, height };
    })
  );
  for (const target of footerTargetSizes) {
    expect(target.width, `${target.text} width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `${target.text} height`).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('release build hashes entry assets, defines immutable caching, and preserves a real 404 response policy', async () => {
  const site = path.join(process.cwd(), 'dist/site');
  const assets = await readdir(path.join(site, 'assets'));
  const appAssets = assets.filter((name) => /^app-[a-zA-Z0-9_-]+\.(?:js|css)$/.test(name));
  expect(appAssets.some((name) => name.endsWith('.js'))).toBe(true);
  expect(appAssets.some((name) => name.endsWith('.css'))).toBe(true);
  expect(assets).not.toContain('app.js');
  expect(assets).not.toContain('app.css');

  const index = await readFile(path.join(site, 'index.html'), 'utf8');
  for (const asset of appAssets) expect(index).toContain(`/assets/${asset}`);
  for (const page of ['demo', 'player', 'privacy', 'terms', 'install']) {
    await expect(readFile(path.join(site, page, 'index.html'), 'utf8')).resolves.toContain('/assets/app-');
  }

  const config = JSON.parse(await readFile(path.join(site, 'staticwebapp.config.json'), 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404.html' });
  for (const asset of appAssets) {
    expect(config.routes).toContainEqual({
      route: `/assets/${asset}`,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  }
  expect(config.routes).toContainEqual({
    route: '/sw.js',
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  });

  const serviceWorker = await readFile(path.join(site, 'sw.js'), 'utf8');
  for (const asset of appAssets) expect(serviceWorker).toContain(`/assets/${asset}`);
  await expect(readFile(path.join(site, '404.html'), 'utf8')).resolves.toContain('/assets/app-');
});
