import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

test('@claim:caption-import opens local SRT and WebVTT files and renders both', async ({ page }) => {
  await page.goto('/player');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  await expect(page.getByText('Mariner', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/opened with 2 timed captions/)).toBeVisible();
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.srt'));
  await expect(page.locator('#caption-text')).toContainText('Take the northbound train.');
  await expect(page.getByText(/example.srt opened with 2 timed captions/)).toBeVisible();
  await expect(page.locator('#caption-text .uncertain')).toHaveText('northbound');
});

test('@claim:supplied-uncertainty marks only confidence supplied by the source', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#caption-text .uncertain')).toHaveText('platform');
  await expect(page.locator('#caption-text .uncertain')).toHaveAttribute('aria-label', 'platform, uncertain');
  await expect(page.locator('.speaker-chip')).toHaveText('Maya');
  await expect(page.locator('#caption-text .chosen')).toHaveText('fourteen.');
});

test('@claim:local-processing keeps imported caption content on the same origin', async ({ page }) => {
  const outside: string[] = [];
  const requested: string[] = [];
  page.on('request', (request) => {
    requested.push(request.url());
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/?demo=1');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  await page.getByRole('button', { name: 'Play' }).click();
  await page.getByRole('button', { name: 'Go forward five seconds' }).click();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.srt'));
  await page.getByLabel('Caption size').fill('52');
  await expect(page.locator('#caption-text')).toContainText('Take the northbound train.');
  expect(outside).toEqual([]);
  expect(requested.join('\n')).not.toContain('northbound');
  expect(requested.join('\n')).not.toContain('Mariner');
});

test('@claim:offline-reload opens the demo without a network after first visit', async ({ page, context }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Sample conversation loaded. Demo changes are not saved.')).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Make each caption easier to follow' })).toBeVisible();
});

test('@claim:keyboard-playback controls playback with Space and arrows', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#time-output')).toContainText('00:05');
});

test('@claim:playback-navigation advances by timer, timeline, and cue buttons', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('#timeline').inputValue()).not.toBe('0');
  await page.getByRole('button', { name: 'Pause' }).click();

  await page.getByLabel('Playback position').fill('9');
  await expect(page.locator('#caption-text')).toContainText('Meet me beside the Cedar Street entrance.');

  await page.locator('[data-cue="4"]').click();
  await expect(page.locator('#time-output')).toContainText('00:17');
  await expect(page.locator('#caption-text')).toContainText('The last service leaves');
});

test('@claim:core-free exposes every caption control without a license', async ({ page }) => {
  await page.goto('/player');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  await expect(page.getByLabel('Caption size')).toBeVisible();
  await expect(page.getByLabel('Mark supplied uncertainty')).toBeChecked();
  await expect(page.getByLabel('Show speaker changes')).toBeChecked();
  await expect(page.getByLabel('Chosen terms')).toBeVisible();
});

test('@claim:paid-profiles verifies the ₹499 contract and enforces five named profiles', async ({ page }) => {
  const contract = JSON.parse(await readFile(path.join(process.cwd(), 'tests/fixtures/billing-contract.json'), 'utf8')) as {
    product: string; amount: number; currency: string; purchase: string; merchant: string; checkout: string; verify: string;
  };
  expect(contract).toMatchObject({ product: 'caption-salience', amount: 499, currency: 'INR', purchase: 'one-time', merchant: 'Sociobot' });
  await page.route(`${contract.verify}**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/player?license=recorded-valid-license');
  await expect(page).toHaveURL(/\/player$/);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sb_license:caption-salience:verdict') || '{}').valid)).toBe(true);
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  for (let index = 1; index <= 5; index += 1) {
    await page.getByLabel('Caption size').fill(String(28 + index * 4));
    page.once('dialog', (dialog) => dialog.accept(`Setup ${index}`));
    await page.getByRole('button', { name: 'Save this setup' }).click();
    await expect(page.getByRole('button', { name: `Load Setup ${index}` })).toBeVisible();
  }
  await expect(page.locator('.profile-box')).toContainText('5/5');
  await expect(page.getByRole('button', { name: 'Save this setup' })).toBeDisabled();
  await expect(page.getByRole('button', { name: /^Load Setup / })).toHaveCount(5);
  await page.getByRole('button', { name: 'Load Setup 1' }).click();
  await expect(page.getByLabel('Caption size')).toHaveValue('32');

  await page.goto('/');
  await expect(page.getByText('Pay ₹499 once to save up to five named setup profiles.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy a license/ })).toHaveAttribute('href', contract.checkout);
  await page.goto('/terms');
  await expect(page.getByText(/Sociobot is the merchant of record/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Request refunds from Sociobot' })).toHaveAttribute('href', 'mailto:support@sociobot.in');
  await page.unroute(`${contract.verify}**`);
  await page.route(`${contract.verify}**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) }));
  await page.goto('/player?license=refunded-license-fixture');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sb_license:caption-salience:verdict') || '{}').valid)).toBe(false);
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  await expect(page.getByRole('button', { name: 'Save this setup' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Buy a license/ })).toBeVisible();
});

test('@claim:billing-data-flow sends only the returned license token to Sociobot verification', async ({ page }) => {
  const outside: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push({ url: request.url(), method: request.method(), body: request.postData() });
  });
  await page.route('https://api.sociobot.in/api/v1/products/caption-salience/verify**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok' })
  }));
  await page.goto('/player?license=returned-token-fixture');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sb_license:caption-salience:verdict') || '{}').valid)).toBe(true);
  expect(outside).toEqual([{
    url: 'https://api.sociobot.in/api/v1/products/caption-salience/verify?license=returned-token-fixture',
    method: 'GET',
    body: null
  }]);
});

test('@claim:local-audio uses playable local audio to drive caption timing without an upload', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url()); });
  await page.goto('/?demo=1');
  await page.setInputFiles('#audio-file', path.join(process.cwd(), 'tests/fixtures/timing.wav'));
  await expect(page.locator('#file-status')).toContainText('timing.wav added');
  await expect.poll(() => page.locator('#local-audio').evaluate((audio: HTMLAudioElement) => audio.duration)).toBeCloseTo(6, 0);
  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('#local-audio').evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(0);
  await page.locator('#local-audio').evaluate((audio: HTMLAudioElement) => { audio.currentTime = 4.3; });
  await expect(page.locator('#time-output')).toContainText('00:04');
  await expect(page.locator('#caption-text')).toContainText('Did you say fourteen');
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

test('@claim:demo-isolation never reads, writes, or transmits real stored data', async ({ page }) => {
  const realState = {
    'caption-salience:preferences': JSON.stringify({ fontSize: 66, preset: 'outline', terms: ['private'], showSpeakers: false, showUncertain: false }),
    'caption-salience:profiles': JSON.stringify([{ name: 'Private setup', preferences: { fontSize: 66 } }]),
    'sb_license:caption-salience': 'private-real-license',
    'sb_license:caption-salience:verdict': JSON.stringify({ valid: true, checkedAt: 1 })
  };
  await page.addInitScript((state) => Object.entries(state).forEach(([key, value]) => localStorage.setItem(key, value)), realState);
  const outside: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url()); });
  await page.goto('/?demo=1&license=demo-must-ignore');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByLabel('Caption size')).toHaveValue('44');
  await page.setInputFiles('#audio-file', path.join(process.cwd(), 'tests/fixtures/timing.wav'));
  await page.getByLabel('Caption size').fill('60');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Caption size')).toHaveValue('44');
  await expect(page.locator('[data-cue]')).toHaveCount(5);
  await page.getByRole('button', { name: 'Leave demo and open captions' }).click();
  await expect(page).toHaveURL(/\/player$/);
  await expect(page.getByRole('heading', { name: 'Your captions will appear here' })).toBeVisible();
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.vtt'));
  await expect(page.locator('#local-audio')).not.toHaveAttribute('src', /.+/);
  expect(await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)])))).toEqual(realState);
  expect(outside).toEqual([]);
});

test('@claim:demo-five-cues opens five realistic timed captions in one click', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.locator('[data-cue]')).toHaveCount(5);
  await expect(page.locator('[data-cue]').first()).toContainText('northbound train leaves');
  await expect(page.locator('[data-cue]').last()).toContainText('last service leaves');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:annotation-syntax parses documented WebVTT and SRT confidence forms at the 70 percent boundary', async ({ page }) => {
  await page.goto('/player');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/annotations.vtt'));
  await expect(page.locator('[data-cue="0"]')).toContainText('alpha');
  await expect(page.locator('#caption-text .uncertain')).toHaveText(['alpha', 'bravo']);
  await page.locator('[data-cue="1"]').click();
  await expect(page.locator('#caption-text .uncertain')).toHaveText('charlie');
  await expect(page.locator('#caption-text .uncertain')).not.toContainText('delta');
  await page.setInputFiles('#caption-file', path.join(process.cwd(), 'tests/fixtures/example.srt'));
  await expect(page.locator('#caption-text .uncertain')).toHaveText('northbound');
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
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(outside).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  await expect(page.getByRole('button', { name: /account|sign in|log in/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /account|sign in|log in/i })).toHaveCount(0);
});

test('@claim:desktop-release builds three platforms and publishes checksum metadata', async ({ request }) => {
  const workflow = await readFile(path.join(process.cwd(), '.github/workflows/release.yml'), 'utf8');
  expect(workflow).toContain("tags: ['v*']");
  expect(workflow).toContain('macos-latest');
  expect(workflow).toContain('windows-latest');
  expect(workflow).toContain('ubuntu-22.04');
  expect(workflow).toContain('SHA256SUMS');
  expect(workflow).toContain('latest.json');

  const releaseResponse = await request.get('https://api.github.com/repos/B-Divyesh/sf-caption-salience/releases/latest');
  expect(releaseResponse.ok()).toBe(true);
  const release = await releaseResponse.json() as { tag_name: string; assets: { name: string; browser_download_url: string }[] };
  const names = release.assets.map((asset) => asset.name);
  expect(names.some((name) => /\.(dmg|app\.tar\.gz)$/i.test(name))).toBe(true);
  expect(names.some((name) => /\.(msi|exe)$/i.test(name))).toBe(true);
  expect(names.some((name) => /\.(AppImage|deb|rpm)$/i.test(name))).toBe(true);
  const manifestAsset = release.assets.find((asset) => asset.name === 'latest.json');
  const checksumAsset = release.assets.find((asset) => asset.name === 'SHA256SUMS');
  expect(manifestAsset).toBeTruthy();
  expect(checksumAsset).toBeTruthy();
  const manifestResponse = await request.get(manifestAsset!.browser_download_url);
  const checksumResponse = await request.get(checksumAsset!.browser_download_url);
  expect(manifestResponse.ok()).toBe(true);
  expect(checksumResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json() as { version: string; platforms: Record<string, string | null> };
  const checksums = await checksumResponse.text();
  expect(manifest.version).toBe(release.tag_name);
  expect(Object.keys(manifest.platforms).sort()).toEqual(['linux', 'macos-arm64', 'macos-x64', 'windows']);
  for (const assetUrl of Object.values(manifest.platforms)) {
    expect(assetUrl).toBeTruthy();
    const assetName = decodeURIComponent(new URL(assetUrl!).pathname.split('/').at(-1)!);
    expect(names).toContain(assetName);
    expect(checksums).toContain(`  ${assetName}`);
  }
});

test('@claim:installer-release-resolution uses the GitHub API and falls back to a working release link', async ({ page, request }) => {
  const apiRequests: string[] = [];
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (X11; Linux x86_64)' }));
  await page.route('https://api.github.com/repos/B-Divyesh/sf-caption-salience/releases/latest', async (route) => {
    apiRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      tag_name: 'v9.9.9',
      html_url: 'https://github.com/B-Divyesh/sf-caption-salience/releases/tag/v9.9.9',
      assets: [{ name: 'Caption.Salience_9.9.9_amd64.AppImage', browser_download_url: 'https://github.com/B-Divyesh/sf-caption-salience/releases/download/v9.9.9/app.AppImage' }]
    }) });
  });
  await page.goto('/install');
  await expect(page.getByText('v9.9.9 is ready for Linux.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Download for Linux.*external/ })).toHaveAttribute('href', /app\.AppImage$/);
  expect(apiRequests).toEqual(['https://api.github.com/repos/B-Divyesh/sf-caption-salience/releases/latest']);

  await page.unroute('https://api.github.com/repos/B-Divyesh/sf-caption-salience/releases/latest');
  await page.route('https://api.github.com/repos/B-Divyesh/sf-caption-salience/releases/latest', (route) => route.fulfill({ status: 503 }));
  await page.reload();
  await expect(page.getByText('Downloads are being published. Check the release page for current files.')).toBeVisible();
  const fallback = page.getByRole('link', { name: /View releases.*external/ });
  await expect(fallback).toHaveAttribute('href', 'https://github.com/B-Divyesh/sf-caption-salience/releases');
  const response = await request.get('https://github.com/B-Divyesh/sf-caption-salience/releases');
  expect(response.ok()).toBe(true);
});

test('invalid and empty files explain the next step', async ({ page }) => {
  await page.goto('/player');
  await expect(page.getByRole('heading', { name: 'Your captions will appear here' })).toBeVisible();
  await page.setInputFiles('#caption-file', { name: 'broken.vtt', mimeType: 'text/vtt', buffer: Buffer.from('not timed captions') });
  await expect(page.getByRole('status')).toContainText('Choose a valid SRT or WebVTT file');
});

test('keyboard focus on each file action is visible on its labeled control', async ({ page }) => {
  await page.goto('/player');
  await expect(page.getByRole('heading', { name: 'Make each caption easier to follow' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('#caption-file')).toBeFocused();
  const captionLabel = page.locator('label.file-label:has(#caption-file)');
  await expect(captionLabel).toHaveCSS('outline-style', 'solid');
  await expect(captionLabel).toHaveCSS('outline-width', '3px');

  await page.keyboard.press('Tab');
  await expect(page.locator('#audio-file')).toBeFocused();
  const audioLabel = page.locator('label.file-label:has(#audio-file)');
  await expect(audioLabel).toHaveCSS('outline-style', 'solid');
  await expect(audioLabel).toHaveCSS('outline-width', '3px');
});

test('client navigation reveals the destination heading and restores scroll on Back', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').scrollIntoViewIfNeeded();
  const homeScrollY = await page.evaluate(() => window.scrollY);
  expect(homeScrollY).toBeGreaterThan(0);

  await page.getByRole('link', { name: 'Privacy', exact: true }).last().click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: 'Keep captions on your device' })).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Privacy — Caption Salience');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const privacyHeading = await page.getByRole('heading', { name: 'Keep captions on your device' }).boundingBox();
  expect(privacyHeading).not.toBeNull();
  expect(privacyHeading!.y).toBeGreaterThanOrEqual(0);
  expect(privacyHeading!.y + privacyHeading!.height).toBeLessThanOrEqual(844);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(homeScrollY - 2);
});

test('deep routes expose their own titles, descriptions, share metadata, focus, and 404 copy', async ({ page }) => {
  const expectations = [
    ['/','Caption Salience — Mark uncertain caption words'],
    ['/?demo=1','Demo — Caption Salience'],
    ['/demo','Demo — Caption Salience'],
    ['/player','Player — Caption Salience'],
    ['/install','Install — Caption Salience'],
    ['/privacy','Privacy — Caption Salience'],
    ['/terms','Terms — Caption Salience']
  ] as const;
  for (const [route, title] of expectations) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('h1')).toBeFocused();
  }
  await page.goto('/missing-caption-page');
  await expect(page).toHaveTitle('Page not found — Caption Salience');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('landing includes three captioned desktop screenshots and labels every external link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.app-tour figure')).toHaveCount(3);
  await expect(page.locator('.app-tour img')).toHaveCount(3);
  for (const image of await page.locator('.app-tour img').all()) await expect(image).toHaveAttribute('alt', /\S+/);
  const externalLinks = page.locator('a[href^="http"]');
  const count = await externalLinks.count();
  for (let index = 0; index < count; index += 1) await expect(externalLinks.nth(index)).toContainText('(external)');
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

test('mobile cold first screen shows the job, audience, action, result, and three facts', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Make uncertain caption words stand out' })).toBeInViewport();
  await expect(page.getByText('For people who hear some speech and need uncertain words to catch their eye.')).toBeInViewport();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeInViewport();
  await expect(page.getByText('See five timed captions with the three marks already applied.')).toBeInViewport();
  for (const fact of ['Caption and audio files stay on this device.', 'Works offline after the first visit.', 'Size and caption marks stay free.']) {
    await expect(page.getByText(fact)).toBeInViewport();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
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
  await expect(readFile(path.join(site, 'privacy/index.html'), 'utf8')).resolves.toContain('<meta property="og:title" content="Privacy — Caption Salience"');
  await expect(readFile(path.join(site, '404.html'), 'utf8')).resolves.toContain('<title>Page not found — Caption Salience</title>');

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

  const identity = JSON.parse(await readFile(path.join(site, 'release-identity.json'), 'utf8')) as { appVersion: string; gitCommit: string };
  const packageInfo = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8')) as { version: string };
  expect(identity.appVersion).toBe(packageInfo.version);
  expect(identity.gitCommit).toMatch(/^[0-9a-f]{40}$/);
});
