import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const output = resolve('dist/site');
const pages = ['demo', 'player', 'privacy', 'terms', 'install'];
const shellPages = ['/', ...pages.map((page) => `/${page}`)];
const html = await readFile(resolve(output, 'index.html'), 'utf8');
const metadata = {
  '/': ['Caption Salience — Mark uncertain caption words', 'Play local SRT and WebVTT captions with separate marks for uncertainty, speakers, and chosen terms.'],
  '/demo': ['Demo — Caption Salience', 'Try Caption Salience with five timed sample captions in an isolated demo.'],
  '/player': ['Player — Caption Salience', 'Open local SRT or WebVTT captions and adjust their visible marks.'],
  '/install': ['Install — Caption Salience', 'Download Caption Salience for macOS, Windows, or Linux.'],
  '/privacy': ['Privacy — Caption Salience', 'Read what Caption Salience keeps on your device and when it uses the network.'],
  '/terms': ['Terms — Caption Salience', 'Read the terms for Caption Salience files, licenses, refunds, and warranty.'],
  '/404': ['Page not found — Caption Salience', 'This Caption Salience page does not exist.']
};

function withMetadata(source, route) {
  const [title, description] = metadata[route];
  const canonical = `https://caption-salience.sociobot.in${route === '/' ? '/' : route}`;
  return source
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`);
}
const packageInfo = JSON.parse(await readFile(resolve('package.json'), 'utf8'));
const assets = await readdir(resolve(output, 'assets'));
const appAssets = assets.filter((name) => /^app-[a-zA-Z0-9_-]+\.(?:js|css)$/.test(name));

if (!appAssets.some((name) => name.endsWith('.js')) || !appAssets.some((name) => name.endsWith('.css'))) {
  throw new Error('Expected hashed application JavaScript and CSS assets.');
}

for (const page of pages) {
  const directory = resolve(output, page);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), withMetadata(html, `/${page}`));
}

await writeFile(resolve(output, 'index.html'), withMetadata(html, '/'));
await writeFile(resolve(output, '404.html'), withMetadata(html, '/404'));

const configPath = resolve(output, 'staticwebapp.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const immutableHeader = { 'Cache-Control': 'public, max-age=31536000, immutable' };
config.routes = config.routes.flatMap((route) => route.route === '/assets/__APP_ASSET__'
  ? appAssets.map((asset) => ({ route: `/assets/${asset}`, headers: immutableHeader }))
  : [route]);
await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

const cacheName = `caption-salience-${appAssets.sort().join('-').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 48)}`;
const shell = [
  ...shellPages,
  '/404.html',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
  '/assets/caption-console-720.webp',
  '/assets/walkthrough-open.webp',
  '/assets/walkthrough-marks.webp',
  '/assets/walkthrough-play.webp',
  ...appAssets.map((name) => `/assets/${name}`)
];

const serviceWorker = `const CACHE = ${JSON.stringify(cacheName)};
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('/') : Response.error())));
});
`;

await writeFile(resolve(output, 'sw.js'), serviceWorker);

// This travels with every Tauri bundle, so release verification can prove that
// a downloadable desktop artifact was built from the same commit as the site.
let gitCommit = 'unknown';
try {
  gitCommit = (await execFileAsync('git', ['rev-parse', 'HEAD'])).stdout.trim();
} catch {
  // Source archives do not include .git. Keep the build usable while making
  // the missing provenance explicit rather than claiming a false identity.
}
await writeFile(resolve(output, 'release-identity.json'), `${JSON.stringify({
  appVersion: process.env.npm_package_version || packageInfo.version,
  gitCommit
}, null, 2)}\n`);

// A prior build can leave an obsolete fixed entry point behind if the output
// directory was copied rather than cleaned by Vite.
for (const legacy of ['assets/app.js', 'assets/app.css']) {
  await rm(resolve(output, legacy), { force: true });
}
