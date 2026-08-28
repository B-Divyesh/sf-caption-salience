# Caption Salience repair handoff — 2026-08-28

## Release status

The two release blockers in independent verification 2 (`81bef816b7f5f8b07385937ff406cc99d0113204`, candidate `9169a0391451e98a739d5ad203178b270829dad6`) are repaired. This remains the same Tauri 2 desktop app with its static landing site and release workflow.

## Repairs

1. **Claim-contract coverage:** added five individual, tagged sandbox claims for the previously unlisted visitor promises:
   - `demo-memory` — demo state is not stored and is discarded on exit.
   - `no-hearing-diagnosis` — the product states and enforces its non-diagnostic boundary.
   - `no-caption-extraction` — only local SRT/WebVTT import is exposed; extraction is not offered.
   - `no-invented-confidence` — ordinary captions render with no uncertainty mark.
   - `no-tracking` — landing/demo traffic is same-origin, with no cookies or account controls.

   Each is listed in `.factory/claims.json` and has exactly one `@claim:<id>` Playwright test from a fresh browser context.

2. **390px mobile geometry and touch targets:** prevented visually-hidden file inputs from inheriting the mobile `width: 100%` rule. The two inputs now remain 1px clipped controls and cannot widen the document. Demo actions, visible header links, and footer links now have 44px minimum dimensions; demo actions keep a 12px gap on mobile.

3. **Regression coverage:** the mobile suite now measures `scrollWidth <= 390` and every visible demo/header/footer target at least 44×44px. This directly covers the verifier’s 405px overflow and 34px/41px target findings.

## Verification

Run from the repository root:

```sh
npm ci
npx tsc --noEmit
npm run build
npm test
npm run verify:billing
sh -n public/install.sh
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

Repair-run evidence:

- `npm ci`: completed, **0 vulnerabilities**.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed. Entry assets are `app-GwiCnDjM.js` (**9.61 KB gzip**) and `app-B5tDzK6V.css` (**4.74 KB gzip**); their SHA-256 values are respectively `c3e84a833a37c896bc5c1755ca3b90f39c3ab29ebdbbbe381e3aaef29c46f5d4` and `8dd465cc84b696386e4d73daa4d2a17a5b071e6d48997ceda779495ce79612ce`. Versioned `sw.js` SHA-256: `91ebbd3869550d8dcfd6a96a3d834484c5dd46ea0aa516c6218783fe6c59e2ff`.
- `npm test`: **4 Vitest tests and 38 Playwright tests passed**; 2 desktop-only mobile geometry skips are intentional. Both Chromium desktop and the 390×844 mobile project ran every claim. Coverage includes keyboard Space/Arrow playback, offline service-worker reload, same-origin local file/audio flows, reduced motion, release policy, and the new geometry measurements.
- Playwright Axe checks on `/`, `/demo`, `/privacy`, `/terms`, and `/install` passed with **0 serious/critical violations** in desktop and mobile projects.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` passed: HTTP 200, `lang=en`, one `h1`, main landmark, title, no missing image alt text or unlabeled buttons, and no console/page errors (698 ms local smoke load). Evidence: `/tmp/caption-verify-3lvkyA/verify.json`.
- `npm run verify:billing`: passed; public checkout redirects to Dodo for the ₹499 license.
- `sh -n public/install.sh`: passed. PowerShell was unavailable in this Linux container, so `install.ps1` was not parsed here.
- After installing the standard Tauri Linux development prerequisites, `cargo check` passed and `cargo test` passed (the Rust shell currently defines zero unit tests).

## Deployment

The static build is deployed after the repair commit is pushed. Deployment URL and post-deploy verification are recorded in the follow-up deployment commit.

## Known limits and operator notes

- The app does not transcribe imported audio. Optional microphone captions use the browser or operating-system speech service.
- SRT has no standard confidence field. WebVTT supports `<c.low>` and `<c.conf-42>`; SRT supports `[?word?]`.
- Desktop artifacts are unsigned. Production signing requires `APPLE_CERTIFICATE` plus related Apple secrets and `WINDOWS_CERT_PFX` plus password in GitHub Actions.
