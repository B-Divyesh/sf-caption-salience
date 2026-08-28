# Independent verification — FAIL

**Candidate:** `efe4cc3a2e1fe9da741549e78899f59e14cf7b7e`  
**Public URL:** <https://caption-salience.sociobot.in>  
**Verified:** 2026-08-28 (fresh `npm ci`, no product-code changes)

## Release decision

**FAIL.** The advertised one-time purchase cannot be completed. The live `Buy a license — ₹499` link targets the required Sociobot checkout endpoint, but a fresh request to `https://api.sociobot.in/api/v1/products/caption-salience/checkout` returned **HTTP 404** with `{"error":"enabled factory product","status":404}`. The product is therefore not registered/enabled with billing even though the live site offers the paid license. This is a P1 release blocker.

The live JavaScript and CSS SHA-256 values exactly matched a fresh production build of this candidate:

- `app.js`: `fee17c3e90dbff7d372a152c645496501b090d6c0225d3b46c6fb2066dbc8ccc`
- `app.css`: `0e8ced123dc2423b8bc35c6cea3d133ad95b1f6735066009ba2bc664d5c76871`

The GitHub release is `v0.1.1`, built from `c103c109…`; the candidate changes only factory handoff documentation relative to that commit. A fresh download of `Caption.Salience_0.1.1_x64_en-US.msi` matched its published SHA256SUMS entry.

## First-read result

**Pass.** On a cold desktop visit, the first screen says it “Make[s] hard-to-hear words stand out,” identifies “people who hear some speech,” and offers the visible one-click action **Try it with sample data**, explained as opening “a timed five-caption conversation.” The action leads to `/demo` with the realistic five-cue sandbox and persistent reset/start-real banner.

## Claims and local quality gates

All ten entries in `.factory/claims.json` were run from the clean checkout, using their listed `npm test -- --grep @claim:<id>` commands. Every command completed successfully in both Chromium and the 390px mobile project:

`caption-import`, `supplied-uncertainty`, `local-processing`, `offline-reload`, `keyboard-playback`, `core-free`, `paid-profiles`, `local-audio`, `microphone-captions`, and `local-preferences`.

Additional clean checks:

- `npm test`: 4 unit tests and 21 browser tests passed; 1 intentional desktop-project skip; 0 failures.
- `npx tsc --noEmit`: passed. No lint script is defined in `package.json`.
- `npm run build`: passed and created `dist/site`.
- Production gzip sizes: JS 9.60 KB and CSS 4.70 KB, within the budgets.
- `npm run tauri -- build`: site prebuild passed, then Rust stopped before project compilation because this container lacks `glib-2.0.pc`. This is a verifier-environment dependency; the public cross-platform release workflow completed successfully.

## Product and accessibility exercise

Fresh live-browser checks passed:

- Imported the representative WebVTT fixture; two timed cues rendered.
- Invalid captions announced: “No timed captions were found. Choose a valid SRT or WebVTT file.”
- Caption size reached both 28 px and 72 px; uncertainty toggle removed and restored its marks; local audio reported it stayed on-device.
- In `/demo`, Space played and Right Arrow sought to 00:05. The 390px layout had no horizontal overflow. Reduced-motion styles made transitions and animations effectively instant.
- Axe found **0 serious/critical** violations on `/`, `/demo`, `/privacy`, `/terms`, and `/install` in both desktop and 390px contexts. Browser console and page errors were zero on those pages.
- `/opt/fleet/lib/verify-url.sh` passed against the landing page: HTTP 200, title, `lang=en`, one h1, a main landmark, no missing image alt text, no unlabeled buttons, and no console errors.
- Demo/local playback made only same-origin requests. `/install` additionally contacted the declared GitHub release API; no analytics/tracking requests were observed. The CSP, HSTS, nosniff, referrer, and permissions headers were present.
- The product's Sociobot verification endpoint correctly rate-limited an 80-request burst (40-way concurrency): 30 requests returned 200 and 50 returned 429, with `Retry-After` values of 1–3 seconds.

## Remaining defects

### P1 — Paid checkout is a live 404 (release blocker)

See the release decision above. Register and enable the `caption-salience` product and its ₹499 checkout with the Sociobot billing API, then independently complete the live purchase/return/verification flow.

### P2 — Static assets have short revalidation and unhashed filenames

Live `/assets/app.js`, `/assets/app.css`, `/sw.js`, and the HTML response all returned `Cache-Control: public, must-revalidate, max-age=30`. The build also emits fixed `assets/app.js` and `assets/app.css` names. This does not meet the static-product immutable-cache policy and needlessly revalidates the shell on repeat visits. Hash the entry CSS/JS filenames and serve hashed assets with long-lived immutable caching.

### P2 — Unknown routes render a page-not-found screen with HTTP 200

`https://caption-salience.sociobot.in/not-a-real-caption-page` returned HTTP 200, although the client correctly showed “This panel has no caption.” Configure the host's 404 response override to rewrite to the designed route while retaining status 404.

## Evidence retained during verification

- Cold desktop screenshot: `/tmp/caption-live-cold-desktop.png`
- Live mobile demo screenshot: `/tmp/caption-live-demo-mobile.png`
- URL verifier JSON: `/tmp/tmp.nDnEh16VfS/verify.json`
- Lighthouse could not run in this container: its Chrome launch crashed after setting the Playwright Chromium path. This is non-blocking because the bundle budget and browser performance smoke checks passed; it does not alter the FAIL decision.
