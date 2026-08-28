# Caption Salience v0.1.1 handoff — FAIL independent verification

## Independent verification status (2026-08-28)

**FAIL — do not release this candidate.** Independent QA against `efe4cc3a2e1fe9da741549e78899f59e14cf7b7e` and `https://caption-salience.sociobot.in` found that the live **Buy a license — ₹499** link returns HTTP 404 from the required Sociobot checkout endpoint. The paid checkout is not registered/enabled, so the product's advertised one-time license cannot be purchased. See `.factory/verification.md` for exact request/response evidence, all passing claim tests, and the two P2 deployment findings (non-immutable static caching and HTTP-200 unknown routes).

The candidate's built JS/CSS hashes match the live deployment exactly. No product code was changed during independent verification.

## What was built

- A Vite and TypeScript caption player with a Tauri 2 desktop shell.
- Local SRT and WebVTT import, including speaker parsing and explicit low-confidence annotations.
- Optional local audio, a timer, cue navigation, and Space, arrow, J, and K shortcuts.
- Three screen-reader-safe emphasis presets, a 28–72 px caption size, speaker labels, and chosen terms.
- Optional microphone captions through the browser or operating-system speech service. Confidence is used only when that service supplies it.
- A one-click `/demo` with five realistic cues, a persistent demo banner, reset, and a memory-only sandbox.
- Local preference storage outside demo mode. Demo mode never reads or writes that namespace.
- A ₹499 one-time Sociobot license flow. Every accessibility control stays free; a valid license adds five named setup profiles.
- `/privacy`, `/terms`, `/install`, a designed 404 state, metadata, social art, PWA shell, offline cache, security headers, sitemap, and robots file.
- A tag-driven Tauri release workflow for macOS arm64/x64, Windows, and Linux. It publishes checksums and `latest.json`.
- Verified one-line Linux and Windows installers that stop on checksum mismatch.

## Visual system and assets

The product uses the mid-century acoustic instrument-panel system in `.factory/design.md`. The original console illustration was generated with the required factory image command, reviewed, and optimized to 18 KB and 47 KB responsive WebP files. The 1200×630 social card is 42 KB. Prompts and provenance are in `assets/src/` and `.factory/design.md`.

## Verification

Run from the repository root:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

Results on 2026-08-28:

- Unit and browser suite: 25 passed, 1 intentional project skip, 0 failed. The skip prevents the mobile-only assertion from running in the desktop project.
- Every entry in `.factory/claims.json` passes through its listed `npm test -- --grep` command shape.
- Playwright axe scan: no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or `/install` in desktop and 390 px mobile projects.
- `/opt/fleet/lib/verify-url.sh`: 200 response, no console errors, one `h1`, `lang=en`, main landmark, no missing alt text, and no unlabeled buttons. Evidence is in `.factory/evidence/`.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.66 s, total blocking time 29 ms, CLS 0.
- Production bundle: 9.60 KB JS gzip and 4.70 KB CSS gzip. The mobile hero is 18 KB.
- `npm run build` writes `dist/site/index.html`.
- `npx tsc --noEmit` passes.
- GitHub release `v0.1.1` completed successfully with macOS arm64/x64 DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `latest.json`, and `SHA256SUMS`.
- A fresh download of `Caption.Salience_0.1.1_x64_en-US.msi` passed verification against the published `SHA256SUMS`.

The first screen was read aloud and fits in one breath: the heading states the job, the sentence names the user, and the action names its result. The full sentence audit is in `.factory/copy-audit.md`.

## Known limits

- Caption Salience does not transcribe imported audio. Microphone captions appear only when the host WebView exposes a speech-recognition service.
- SRT has no standard confidence field. The supported explicit notation is `[?word?]`. WebVTT accepts `<c.low>` and `<c.conf-42>` annotations.
- The local Rust check could not complete in the worker because GLib/WebKit development packages are absent. The failure occurred before project code compiled. The Linux GitHub runner installs those packages before building.
- Desktop builds are unsigned until operator certificates are configured.

## Needs operator action

- Register `caption-salience` and its ₹499 price with the Sociobot billing service. The app contains no product ID or payment-provider code.
- Configure `APPLE_CERTIFICATE`, the related Apple signing secrets, and `WINDOWS_CERT_PFX` with its password when signed releases are wanted. The current workflow intentionally produces unsigned builds without them.
- Deploy `dist/site` through the factory. No DNS or infrastructure changes were made here.
