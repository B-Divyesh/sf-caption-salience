# Independent verification 3 — FAIL

**Candidate:** `13ca7bf7179f7b03315659951cc697b45fdb4011`  
**Public URL:** <https://caption-salience.sociobot.in>  
**Verified:** 2026-08-28 from the clean candidate checkout. Product code was not modified.

## Release decision

**FAIL.** The prior claim-coverage, mobile geometry, billing, caching, and 404 defects are repaired on the web deployment. The live web shell is byte-for-byte identical to this candidate and its normal product flows work. This candidate nevertheless has two independent P1 release blockers:

1. The Install page downloads desktop packages built from old commit `c103c109d3749394eb4fd303d55b6dc82c2ec1d8`, not this candidate. Those packages embed the pre-repair UI.
2. The two primary file-import controls have no visible keyboard focus. Tab reaches clipped 1×1px inputs while the visible controls retain no outline.

A P2 client-routing defect also leaves a newly focused route heading above the viewport when navigation starts from a scrolled page.

## Release-blocking defects

### P1 — The downloadable desktop app is not the candidate

The live `/install` page selects GitHub release `v0.1.1`. GitHub reports that release and its only successful release workflow run were built from `c103c109d3749394eb4fd303d55b6dc82c2ec1d8`, while the acceptance candidate is `13ca7bf…`.

This is an observable product mismatch, not a documentation-only difference:

- `git diff c103c109…13ca7bf` includes `src/main.ts` and `src/styles.css` changes that repair demo target sizes and the 390px overflow.
- The downloaded Linux binary contains `/assets/app.js` and `/assets/app.css`, the old fixed entry paths.
- A fresh candidate build emits `/assets/app-GwiCnDjM.js` and `/assets/app-B5tDzK6V.css`.
- The candidate's repair specifically changes the old desktop bundle's 34px demo actions, undersized navigation/footer links, and mobile hidden-input width rule.

The release has real macOS, Windows, and Linux assets and valid checksums, but it does not distribute the tested candidate. Publish a new tag from the accepted commit and verify the packaged resources before release.

### P1 — Primary file actions have invisible keyboard focus

Fresh live Chromium at `/player`, starting from the programmatically focused `<h1>`:

1. First Tab focuses `#caption-file`. Its box is **1×1px** at `(1416, 273.6)`. The visible “Open SRT or WebVTT” label is 199.7×47.3px but computes to `outline: none`.
2. Second Tab focuses `#audio-file`, also **1×1px**. The visible “Add local audio” label is 150.5×47.3px and also has `outline: none`.

The focused inputs have a 3px outline, but `.sr-only` clips that outline to a non-visible pixel. The selector `label[for]:focus-within` cannot match because each input is a sibling of its label, not a descendant. Keyboard users therefore cannot see which primary import action is active. This violates the required designed visible focus state for every interactive element.

### P2 — Client navigation can focus an off-screen heading

From the bottom of the landing page, selecting the footer Privacy link navigates to `/privacy` and focuses “Keep captions on your device,” but preserves enough prior scroll that the heading bounds are `top: -267.7px; bottom: -81.1px`. The destination begins at `scrollY: 483`, with its focused heading completely above the viewport. Route changes should put the new page heading in view while back/forward restores each route's prior position.

## Mandatory first-read test — PASS

Cold live desktop first viewport:

- **What it does:** “Make hard-to-hear words stand out.”
- **For whom:** “For people who hear some speech and need uncertain words to catch their eye.”
- **What to do first:** visible **Try it with sample data**, followed by “It opens a timed five-caption conversation.”

The same information and all three facts are visible at 390×844. One click opens `/demo` with five populated cues and the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real. Landing and demo produced no console or page errors.

## Claim contract — listed tests PASS

`.factory/claims.json` exists with 15 entries. Before any other product QA, each exact listed command was invoked from the clean checkout. The first invocation stopped at `vitest: not found` because dependencies were not yet installed. After the required `npm ci`, every command was rerun and passed in both the Chromium desktop and 390px mobile projects:

| Claim | Result |
| --- | --- |
| `caption-import` | PASS |
| `supplied-uncertainty` | PASS |
| `local-processing` | PASS |
| `offline-reload` | PASS |
| `keyboard-playback` | PASS |
| `core-free` | PASS |
| `paid-profiles` | PASS |
| `local-audio` | PASS |
| `microphone-captions` | PASS |
| `local-preferences` | PASS |
| `demo-memory` | PASS |
| `no-hearing-diagnosis` | PASS |
| `no-caption-extraction` | PASS |
| `no-invented-confidence` | PASS |
| `no-tracking` | PASS |

Each command passed 4 Vitest parser tests plus its tagged Playwright test in both projects. The initial missing-dependency stops were setup evidence, not behavioral claim failures.

## Clean build and repository gates

- `npm ci`: passed; 63 packages installed; 0 vulnerabilities.
- `npx tsc --noEmit`: passed.
- `npm test`: **4 unit tests and 38 browser tests passed**, with 2 intentional desktop skips for mobile-only geometry.
- `npm run build`: passed and produced `dist/site/`.
- `npm run verify:billing`: passed; product registered at ₹499 and checkout redirects to Dodo.
- `sh -n public/install.sh`: passed. PowerShell is unavailable in this Linux verifier, so `install.ps1` was inspected but not executed.
- No lint script exists in `package.json`.
- Initial `cargo check`/`cargo test` correctly identified missing Tauri Linux development libraries. After installing the exact packages from the release workflow, `cargo check` passed and `cargo test` passed (0 Rust unit/doc tests are defined).

Production asset sizes:

- JS: 26,954 bytes raw / **9,589 bytes gzip**.
- CSS: 18,111 bytes raw / **4,752 bytes gzip**.
- Mobile hero WebP: **18,040 bytes**; 1200px WebP: 47,224 bytes.
- Fresh mobile Lighthouse transferred **73 KiB** over 7 requests, with no third-party request.

## Functional and recovery exercise

Fresh live-browser exercise covered the smallest useful job:

- Empty `/player` explained how to open captions.
- A malformed VTT produced “No timed captions were found. Choose a valid SRT or WebVTT file.”
- Uploading the valid fixture immediately recovered, reported 2 timed captions, and rendered the speaker/cues.
- Caption size reached and rendered the 28px and 72px boundaries; 72px persisted across a real-mode reload.
- Space changed Play to Pause; Right Arrow moved to `00:05`; J/K moved to the previous/next cue.
- A local WAV reported that it stayed on-device; the entire landing/demo/file/audio exercise made no outside request.
- Microphone fixture coverage passed; the live browser exposed a clear listening/status state.
- Reset demo restored 44px and `00:00 / 00:22`; Start for real discarded sample cues and opened the empty real player.
- Direct route loads, history titles, invalid recovery, and the designed 404 worked.

## Accessibility, mobile, and motion

- Independent live Axe runs found **0 serious/critical violations** on `/`, `/demo`, `/player`, `/privacy`, `/terms`, `/install`, and the 404 page in desktop and 390px contexts.
- Every checked route had `lang=en`, one `<h1>`, one `<main>`, and a route-specific title.
- `/opt/fleet/lib/verify-url.sh` passed locally and live: no regular-page console/page errors, no missing alt text, and no unlabeled buttons. Local load was 613ms; live load was 958ms. Evidence: `/tmp/caption-verify3-IWDeol/`.
- Live `/demo` at 390px had `scrollWidth=clientWidth=390`. Demo, header, and footer targets were all at least 44×44px.
- Reduced motion changed the meter transition from 0.22s to 0.00001s.
- The accessibility tree exposes the uncertain token as `platform, uncertain` while retaining the spoken text in order.
- The invisible file-focus defect above is not detected by Axe and remains blocking.

## Performance, privacy, security, and PWA

Fresh mobile Lighthouse against the live URL:

- Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**.
- FCP 1.0s, LCP 1.3s, CLS 0, TBT 230ms, Speed Index 1.0s.

Privacy/network evidence:

- Landing, demo, imported caption, local audio, and playback requested only `caption-salience.sociobot.in`.
- `/install` additionally called only the documented `api.github.com` release endpoint.
- No analytics, ads, accounts, CDN fonts/scripts, cookies, Azure/OpenAI endpoints, console errors, or page errors were observed on normal routes.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive origin allowlist CSP, frame blocking, and camera/geolocation/microphone permissions policy.
- Hashed JS/CSS return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`; the HTML revalidates after 30 seconds.
- Unknown routes return a real HTTP 404 and the designed page.

PWA evidence:

- The live service worker activated and controlled the page.
- Its versioned cache was `caption-salience-app-B5tDzK6V-css-app-GwiCnDjM-js` and contained the demo shell and candidate JS.
- `registration.update()` completed with no waiting worker.
- After going offline, `/demo` reloaded with its heading, banner, and all five cues, with no console error.

## Billing and rate limiting

- Public checkout returned HTTP **303** to a Dodo checkout session.
- An invalid token returned HTTP 200 with `{ "valid": false, "reason": "invalid" }` and `Cache-Control: no-store`.
- Fresh 80-request concurrent burst against the product verification endpoint: **30×200, then 50×429**. Every observed 429 had `Retry-After: 4` and body `Too Many Requests! Wait for 4s`.
- No sign-in is required, so the Entra tenant requirement is not applicable.

## Deployment and install evidence

The live static deployment exactly matches the candidate build:

| File | SHA-256 (local and live) |
| --- | --- |
| `index.html` | `5a7c8348cf298a4ef8b21be71a49b03837dee2927c20dcf455dd802dc5ac85de` |
| `app-GwiCnDjM.js` | `c3e84a833a37c896bc5c1755ca3b90f39c3ab29ebdbbbe381e3aaef29c46f5d4` |
| `app-B5tDzK6V.css` | `8dd465cc84b696386e4d73daa4d2a17a5b071e6d48997ceda779495ce79612ce` |
| `sw.js` | `91ebbd3869550d8dcfd6a96a3d834484c5dd46ea0aa516c6218783fe6c59e2ff` |

The public release contains macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json`. The live Linux one-line installer was run into an isolated temporary directory. It downloaded the 80,558,584-byte AppImage, verified SHA-256 `78c703812d5906cda0ce119fbb68e696b67ed88b516c02bda6b324b6f7c0ae75`, and installed it executable. The downloaded DEB also matched its checksum and stayed running for an 8-second Xvfb smoke launch. These packages are installable but stale, as detailed in the P1 finding.

All legitimate discovered links returned 200, except the deliberate not-found test which correctly returned 404.

## Required remediation

1. Publish a new desktop release from the accepted candidate commit and verify packaged app resources identify that build.
2. Make each visible file label receive a designed focus ring when its clipped input has focus, and add a regression test that asserts the visible focus indicator.
3. On client-side route navigation, put the new `<h1>` in view; preserve and restore scroll only for back/forward history entries.
4. Rerun all 15 claim commands, full tests/build/native checks, live identity, package extraction, keyboard-only QA, Axe, Lighthouse, offline update/reload, and the API rate-limit burst.

## Evidence locations

- Cold screenshots: `/tmp/caption-live-cold-desktop.png`, `/tmp/caption-live-cold-mobile.png`, `/tmp/caption-live-demo-desktop.png`
- Focus screenshot: `/tmp/caption-file-focus.png`
- URL verifier: `/tmp/caption-verify3-IWDeol/`
- Live/local identity downloads: `/tmp/caption-identity-pvBIAk/`
- Fresh Lighthouse JSON: `/tmp/caption-lighthouse-live.json`
- Release metadata: `/tmp/caption-release.json`, `/tmp/caption-runs.json`
- Extracted/checksummed stale DEB: `/tmp/caption-release3-DFxQvW/`
- One-line installer result: `/tmp/caption-install3-hsorMn/`
