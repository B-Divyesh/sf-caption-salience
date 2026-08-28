# Independent verification 2 — FAIL

**Candidate:** `9169a0391451e98a739d5ad203178b270829dad6`  
**Public URL:** <https://caption-salience.sociobot.in>  
**Verified:** 2026-08-28 from a clean checkout; no product code was modified.

## Release decision

**FAIL.** The prior deployment-only blockers are fixed: live checkout now redirects to Dodo, hashed static assets are immutable, and an unknown route returns HTTP 404. However, this candidate still fails the acceptance contract for two independent reasons:

1. Several visitor-facing promises have no entry in `.factory/claims.json` and therefore no required sandbox proof. The claims contract explicitly makes this a failing finding.
2. The required 390px mobile experience has horizontal overflow and undersized touch targets, including the persistent demo actions.

These are release blockers under the supplied claims, demo-sandbox, accessibility, and definition-of-done requirements.

## First-read test — PASS

Cold live desktop page, before interaction:

- **What it does:** “Make hard-to-hear words stand out.”
- **For whom:** “For people who hear some speech and need uncertain words to catch their eye.”
- **What to click first:** visible **Try it with sample data**, immediately explained as opening “a timed five-caption conversation.”

The one-click action opens `/demo`, which shows a five-cue sample, the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real. This portion meets the plain-words and demo entry requirements.

## Claim contract — PASS for listed tests; FAIL for unlisted promises

`.factory/claims.json` exists and contains ten entries. From the clean checkout after `npm ci`, I ran every listed command through the supplied Playwright demo entry point. Every command passed in both Chromium and the 390px mobile project:

| Claim id | Result |
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

Each command was `npm test -- --grep @claim:<id>` and passed its four Vitest parser tests plus two browser projects. The full suite also passed (4 unit tests; 27 browser tests passed, 1 intentional desktop-project skip).

### P1 — Unlisted, unproved visitor promises

The following claims appear in live copy and/or README but are not represented by an id in `.factory/claims.json` with an observable sandbox test:

- “Demo — sample data, nothing is saved”; README: “Demo data stays in memory and is discarded when you leave.”
- “It does not diagnose hearing loss.”
- “It does not extract video or protected captions.”
- “It does not invent confidence scores.”
- Privacy page/README: “no analytics, advertising, accounts, or tracking cookies.”

Some related behaviour is implemented and other listed claims cover caption import, local processing, and source-supplied uncertainty. That does not satisfy the required one-claim/one-tagged-test contract for these distinct promises. Add specific claims and sandbox assertions, or remove/reword the promises.

## Functional exercise — PASS except mobile defects below

Fresh live-browser exercise covered the smallest useful product:

- Landing CTA entered `/demo`; the realistic five-cue conversation rendered.
- Space changed Play to Pause; Right Arrow advanced to `00:05 / 00:22`; Reset demo returned it to `00:00 / 00:22`.
- The supplied-uncertainty toggle reduced `.uncertain` marks from 1 to 0 and restored them; the font-size boundary reached `72 px`.
- The complete suite covered the representative fixture import, invalid/empty file recovery, local-audio status/no upload, microphone fixture, profile limit, persistence, and 28/72 px boundaries.
- An online live visit registered a controlling service worker; an offline reload of `/demo` showed the player and demo banner without console errors. The built worker cache name is derived from the exact hashed CSS/JS and uses `skipWaiting` plus old-cache deletion; the update policy is therefore versioned.

### P1 — Required 390px mobile QA fails

At a 390×844 viewport on live `/demo`, `document.documentElement.scrollWidth` was **405px** while `clientWidth` was **390px**. The two visually-hidden file inputs each had bounds `left: 15px; right: 405px; width: 390px`, producing a 15px horizontal scroll.

The same inspection found mandatory interactive targets below 44px:

- Demo banner **Reset demo**: 78×34px.
- Demo banner **Start for real**: 83×34px.
- Mobile header Demo/Install/Privacy links: 41px high.
- Footer Privacy/Terms links: 20px high.

This violates the explicit 44×44px touch-target requirement, especially for the two persistent demo controls. Correct the hidden-input technique so it cannot enlarge the layout and make all actionable targets at least 44×44px with adequate separation.

## Accessibility, keyboard, and presentation

- Axe (`@axe-core/playwright`) found **0 serious/critical violations** on `/`, `/demo`, `/player`, `/privacy`, `/terms`, and `/install`, each at desktop and 390px.
- Each checked route had `lang=en`, exactly one `<h1>`, one `<main>`, route-specific title, no page errors, and no console errors.
- Keyboard smoke test passed: the visible 3px orange focus outline was present on focused inputs; Space and arrow playback work; Shift+Tab reaches the skip link and header navigation. Reduced-motion context reduced the meter transition to `0.00001s`.
- The project does not contain the requested `verify-url.sh`; the equivalent checks above were run directly. Axe was run through its installed Playwright integration.
- Existing local Lighthouse evidence reports 100/100 performance, accessibility, best practices, and SEO. Fresh build asset sizes were JS 9.61KB gzip and CSS 4.70KB gzip, within the 200KB/50KB budgets; hero assets are below 300KB.

## Privacy, network, security, and billing

- Fresh landing and demo playback requested only `caption-salience.sociobot.in`; no analytics, CDNs, fonts, or Azure/OpenAI hosts were observed. `/install` additionally used the declared `api.github.com` release endpoint. Local-file and demo claim tests intercepted only same-origin playback traffic.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, a restrictive CSP, and `Permissions-Policy: camera=(), geolocation=(), microphone=(self)`.
- Hashed JS and CSS are served `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` is no-store. Unknown `/not-a-real-caption-page` returns HTTP 404 and renders the styled in-app not-found page.
- `npm run verify:billing` passed. Live `GET /api/v1/products/caption-salience/checkout` returned HTTP 303 to a Dodo session. Invalid license verification returned HTTP 200 with `{ "valid": false, "reason": "invalid" }`.
- Rate-limit test: an 80-request burst at concurrency 40 against the product verification endpoint produced **30×200 then 50×429**. 429 responses included `Retry-After` values from 1 to 3 seconds. Observed threshold: 30 successful requests in that burst.

## Deployment and desktop release checks

- A fresh `npm run build` passed, produced `dist/site`, and deployed byte hashes matched exactly:
  - JS `app-DkAMavmu.js`: `f71bfeabc534f735bdf92fc82a449a822e7567803c22a0fd5e41aabd12b49710`
  - CSS `app-CErYGqGY.css`: `0e8ced123dc2423b8bc35c6cea3d133ad95b1f6735066009ba2bc664d5c76871`
  - service worker: `cf01505365ed6b534a556b07eda9456f5dab2538fa148859a1ea4dca6076157f`
- `npx tsc --noEmit` passed. There is no lint script. `sh -n public/install.sh` passed; PowerShell is unavailable in this verifier container, so `install.ps1` could not be parsed/executed here.
- The public `v0.1.1` GitHub release has macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json`. The latest release workflow completed successfully. Downloaded `Caption.Salience_0.1.1_x64_en-US.msi` matched its published checksum. Live `/install` correctly selected the Linux AppImage and had no console error.
- `cargo test`/`cargo check` could not compile the native Tauri shell in this container because `glib-2.0.pc` is absent. The static production build passed; the repository release workflow installs the required Linux packages and has a successful public release. This is an environment limitation, not the basis for the FAIL.

## Required remediation

1. Add individual claim-contract entries/tests for each remaining visible privacy/demo/limitation promise, or remove the unproved text.
2. Fix the 390px horizontal overflow and ensure every interactive target, including navigation/footer/demo controls, is at least 44×44px.
3. Rerun the complete claim contract, mobile geometry check, accessibility suite, production build, and live deployment comparison after the fix.

## Evidence locations

- Live screenshots: `/tmp/caption-live-desktop.png`, `/tmp/caption-live-demo-mobile.png`
- Live fetches/hashes: `/tmp/caption-live.headers`, `/tmp/live-app.js`, `/tmp/live-app.css`, `/tmp/live-sw.js`
- Rate-limit headers and status count: `/tmp/tmp.K9uAjqD02p`
- Release metadata and downloaded checksum evidence: `/tmp/caption-release.json`, `/tmp/caption-SHA256SUMS`, `/tmp/caption-latest.json`, `/tmp/Caption.Salience_0.1.1_x64_en-US.msi`
