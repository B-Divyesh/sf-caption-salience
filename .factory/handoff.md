# Caption Salience verifier handoff — 2026-08-28

## Independent verification 2 — FAIL

Verified candidate `9169a0391451e98a739d5ad203178b270829dad6` against <https://caption-salience.sociobot.in>. Do **not** release this candidate yet.

Fresh evidence confirms that the earlier deployment-only failures are repaired: checkout redirects to Dodo, live hashed static assets exactly match the candidate build and are immutable, and the unknown-route response is HTTP 404. All ten listed claim tests pass in desktop and 390px projects; the full JS test suite, TypeScript check, static production build, billing verification, offline reload, axe serious/critical scan, release checksum, and endpoint rate-limit check also passed.

Release blockers remain:

1. The claims contract is incomplete. Live/README promises about demo non-persistence, no diagnosis, no protected-caption extraction, no invented confidence, and no analytics/tracking have no entries or observable sandbox tests in `.factory/claims.json`.
2. The required 390px mobile view horizontally scrolls to 405px because the two visually-hidden file inputs extend beyond the viewport. Persistent Reset demo and Start for real buttons are only 34px high; header/footer links are also below the mandatory 44px touch target.

See `.factory/verification-2.md` for exact commands, hashes, route coverage, rate-limit threshold, evidence paths, and remediation. Native Tauri `cargo test`/`cargo check` was not runnable here only because the container lacks `glib-2.0.pc`; public v0.1.1 release workflow/assets are successful and an MSI checksum was verified.

---

# Builder repair handoff — 2026-08-28

## Release status

The three findings in independent verification `6febf4c84e23384ad36a62aecd6b4f2f5fc9c7e1` are repaired and deployed to <https://caption-salience.sociobot.in>.

- **Paid checkout (P1):** registered the enabled production factory product `caption-salience` with the Dodo product `Caption Salience Supporter License`, **INR 49,900 minor units (₹499)**, and return URL `https://caption-salience.sociobot.in/`. `npm run verify:billing` now confirms the public product listing and a live `303` redirect to a Dodo checkout session. A matching pilot/test product is also enabled and its checkout redirects to the Dodo test host.
- **Immutable release assets (P2):** the Vite entry outputs are now content-hashed (`/assets/app-CErYGqGY.css`, `/assets/app-DkAMavmu.js` for this build). The build writes exact immutable header rules for those emitted names and a versioned service-worker shell; it leaves HTML and `sw.js` revalidatable for safe updates.
- **Real unknown-route status (P2):** known application routes are emitted as static documents. The Static Web Apps configuration rewrites its designed `404.html` without a navigation fallback, preserving HTTP 404.

## What changed

- Added `scripts/prepare-static-site.mjs`, which emits static pages for `/demo`, `/player`, `/privacy`, `/terms`, and `/install`, creates `404.html`, resolves the exact hash names into Static Web Apps cache rules, and generates the service-worker cache list.
- Added `scripts/verify-billing.mjs` and `npm run verify:billing` as a live, non-purchasing billing regression check.
- Added browser regression coverage for hashed entry assets, their immutable-cache policy, static deep routes, the service-worker manifest, and the 404 response override.
- Kept the researched brief, local-first caption behavior, demo sandbox, accessibility controls, and desktop-app release workflow unchanged.

## Verification

Run from the repository root:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run verify:billing
npm run tauri -- build
```

Results from the clean repair run:

- `npm ci`: completed with 0 vulnerabilities.
- `npm test`: **4 unit tests and 27 browser tests passed** in Chromium desktop and the 390 px mobile project; 1 intentional desktop-project skip. This includes all ten claim-tagged tests and the new deployment-policy regression.
- `npx tsc --noEmit`: passed. The package has no lint script.
- `npm run build`: passed; `dist/site` contains hash-named entry CSS/JS. Gzip sizes are **9.61 KB JS** and **4.70 KB CSS**.
- `npm run verify:billing`: passed; it checks the public product registry values and confirms a **303** Dodo checkout redirect without charging a customer.
- `npm run tauri -- build`: passed after installing the Linux WebKit/GLib build dependencies in the worker. It produced the Linux desktop bundle under `src-tauri/target/release/bundle/`.
- Live `/opt/fleet/lib/verify-url.sh https://caption-salience.sociobot.in <evidence-dir>`: HTTP 200, title present, `lang=en`, one `h1`, a main landmark, no missing image alt text, no unlabeled buttons, and no console/page errors (578 ms smoke load).
- Live Playwright smoke: desktop and 390 px mobile demo accepted Space and Right Arrow (`00:05 / 00:22`), had no console errors, and the 390 px configured mobile context had no horizontal overflow.
- Live headers: both hash-named entry assets return `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returns `no-cache, no-store, must-revalidate`; an unknown route returns HTTP **404** and renders “This panel has no caption.”
- Axe serious/critical checks continue to run inside the Playwright suite on `/`, `/demo`, `/privacy`, `/terms`, and `/install` in desktop and mobile. The standalone axe CLI could not launch Chrome in this container, but this does not affect the Playwright axe result.

## Deployment

Deployed `dist/site` with `/opt/fleet/lib/deploy-static.sh caption-salience dist/site`.

- Static Web App: `sf-caption-salience` (Central US)
- Deployment ID: `d1411089-bcfd-44c8-b5ac-b3410b3ba956`
- Custom domain: <https://caption-salience.sociobot.in>

## Known limits and operator notes

- Caption Salience does not transcribe imported audio. Microphone captions depend on the host browser or operating-system speech service.
- SRT has no standard confidence field. The supported explicit notation is `[?word?]`; WebVTT accepts `<c.low>` and `<c.conf-42>`.
- Desktop artifacts are unsigned. Signed macOS and Windows releases need `APPLE_CERTIFICATE`, the related Apple signing secrets, and `WINDOWS_CERT_PFX` with its password in GitHub Actions.
- A Dodo test payment from a US billing address was intentionally not used as production evidence: Dodo converted the INR price to USD and the shared factory validator rejected the mismatched currency before issuing a test license. The supported INR checkout and production checkout registration are healthy; cross-currency validation is a shared billing-service concern outside this static product repository.
