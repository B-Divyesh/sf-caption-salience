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
