import { readdirSync } from 'node:fs';

const version = process.argv[2] || 'v0.1.0';
const base = `https://github.com/B-Divyesh/sf-caption-salience/releases/download/${version}`;
const files = readdirSync('.').filter((name) => name !== 'SHA256SUMS' && name !== 'latest.json');
const find = (pattern) => files.find((name) => pattern.test(name)) || null;
const platforms = {
  'macos-arm64': find(/aarch64.*(?:\.dmg|\.app\.tar\.gz)$/i),
  'macos-x64': find(/(?:x64|x86_64).*(?:\.dmg|\.app\.tar\.gz)$/i),
  windows: find(/\.(msi|exe)$/i),
  linux: find(/\.(AppImage|deb)$/i)
};
console.log(JSON.stringify({ version, platforms: Object.fromEntries(Object.entries(platforms).map(([key, name]) => [key, name ? `${base}/${encodeURIComponent(name)}` : null])) }, null, 2));
