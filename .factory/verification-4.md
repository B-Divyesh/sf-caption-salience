# Independent verification 4 — PASS

**Candidate:** `2cccd021ffa11a5f7ac3d606033cbd6f88a35665`  
**Public URL:** <https://caption-salience.sociobot.in>  
**Verified:** 2026-08-29 from a clean checkout. Product code was not changed.

## Release decision

**PASS.** The live deployment identifies itself as version `0.1.2`, commit
`2cccd021ffa11a5f7ac3d606033cbd6f88a35665`; its production JavaScript has
the same SHA-256 as the clean local candidate build:

```
0eb053c127008030fa2ba7b93b6d7cea14bb0c7e4ce94e3815383cdb699eb8cf
```

There are no release-blocking defects found in this verification.

## Mandatory cold first-read and demo check

Fresh Chromium at `/`, with no existing browser state, showed:

- **What it does:** “Make hard-to-hear words stand out.”
- **For whom:** “For people who hear some speech and need uncertain words to catch their eye.”
- **What to click first:** visible **Try it with sample data**, with “It opens a timed five-caption conversation.” beside it.

The first screen also shows the three plain facts (local files, offline after
first visit, free core controls). One click opens `/demo`, populated with the
five-cue conversation and its persistent “Demo — sample data, nothing is
saved” banner, Reset demo, and Start for real actions. This passes the
plain-words and demo-sandbox gates.

## Claim contract — PASS

`.factory/claims.json` exists with 15 entries. After the clean-install
prerequisite (`npm ci`), I invoked every exact command listed in that manifest
through the demo entry point. All passed in both the Chromium desktop and
390×844 mobile projects:

| Claim IDs | Result |
| --- | --- |
| `caption-import`, `supplied-uncertainty`, `local-processing` | PASS |
| `offline-reload`, `keyboard-playback`, `core-free` | PASS |
| `paid-profiles`, `local-audio`, `microphone-captions` | PASS |
| `local-preferences`, `demo-memory`, `no-hearing-diagnosis` | PASS |
| `no-caption-extraction`, `no-invented-confidence`, `no-tracking` | PASS |

The final full-suite state is `test-results/.last-run.json` with
`{"status":"passed","failedTests":[]}`. `npm test` ran 4 Vitest parser
tests and 44 Playwright project tests: 42 passed and 2 expected
desktop-only mobile-geometry skips.

## Clean repository and native package checks

- `npm ci`: passed; 63 packages installed; npm audit reported 0 vulnerabilities.
- `npx tsc --noEmit`: passed. No lint script is defined by the repository.
- `npm test`: passed as above.
- `npm run build`: passed and produced `dist/site/`.
  - JS: 27,286 bytes raw, **9,699 bytes gzip**.
  - CSS: 18,111 bytes raw, **4,747 bytes gzip**.
  - Both are inside the 200 KB JS / 50 KB CSS budgets.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed after installing
  the standard GTK/WebKit development packages missing from the disposable
  container.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed (0 Rust unit or
  documentation tests are defined).
- `CI=true npx tauri build --bundles deb`: passed. The resulting local
  `Caption Salience_0.1.2_amd64.deb` is 2,966,080 bytes, contains
  `app-CuTsQjMP.js` and `release-identity.json`, and stayed running under
  Xvfb for eight seconds with no stderr output.
- `sh -n public/install.sh`: passed.

## Independent functional exercise

On the deployed app I verified the real caption-player job rather than only
control presence:

- `/demo` exposes source-supplied `platform, uncertain`, speaker `Maya`, and
  chosen term `fourteen.` as separate accessible semantics.
- Space changes Play to Pause; Right Arrow moves the time display to
  `00:05 / 00:22`; Pause returns the player to stopped state.
- The real second file action received focus after Tab with the visible
  `rgb(255, 180, 75) solid 3px` product focus outline.
- The suite independently covers valid SRT/WebVTT import, ordinary captions
  with no invented uncertainty, malformed-file recovery, local audio,
  microphone recognition fixture, 28–72px sizing, preference persistence,
  demo reset/exit isolation, and the five-profile licensed fixture.
- Offline reload of `/demo` succeeded after first load. A service-worker
  update check found an activated controller, no waiting worker, and cache
  `caption-salience-app-CuTsQjMP-js-app-tXa-ZJPb-css`.

## Accessibility, mobile, privacy, and security

- `/opt/fleet/lib/verify-url.sh` passed live: 604 ms load; title, `lang=en`,
  one h1, main landmark, image alt text, and button labels all present; no
  console or page errors.
- Fresh Axe checks found **zero serious or critical violations** on `/`,
  `/demo`, `/privacy`, `/terms`, and `/install`.
- At 390px `/demo` had zero horizontal overflow; caption-size and Play stayed
  visible. Demo banner and visible header targets measured at least 44px in
  both dimensions.
- Reduced motion changes the meter transition from `0.22s` to `0.00001s`.
- Fresh landing/demo playback requests were same-origin, with no cookies,
  account controls, analytics, advertising, CDN fonts, or third-party
  scripts. `/install` makes only the documented `api.github.com` release
  metadata request.
- Live headers include CSP with only self plus those documented API origins,
  HSTS, `nosniff`, strict-origin referrer policy, frame blocking, and a
  camera/geolocation/microphone permissions policy. Hashed JS/CSS are
  immutable for one year; `sw.js` is no-store; HTML revalidates at 30 seconds.
  An unknown route returns real HTTP 404 and the designed fallback.

## Billing, rate limit, and downloads

- `npm run verify:billing` passed: the registered ₹499 product redirects to a
  Dodo checkout session.
- An 80-request concurrent invalid-license burst to the documented Sociobot
  verification endpoint yielded **29 × 200 and 51 × 429**. Every 429 carried
  `Retry-After: 3`; the observed allowance is therefore 29 successful requests
  in that fresh burst before enforcement.
- No sign-in exists, so the Entra tenant condition is not applicable.
- GitHub release `v0.1.2` supplies macOS arm64/x64, Windows MSI/EXE, Linux
  AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json`. The downloaded
  public DEB matched its published SHA-256. The live shell installer installed
  the 76.8 MB AppImage into an isolated `XDG_BIN_HOME` only after matching
  SHA-256 `19e588545b6acc95bdd725bdb64663f951b1468e37ddcae8ae6ccbf535410647`.

The release tag points to `9684075`; `git diff 9684075..2cccd02` contains
only `.factory/handoff.md`, so this is not a product or package mismatch.

## Defects by severity

None found.

## Evidence commands

```sh
npm ci
npx tsc --noEmit
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
CI=true npx tauri build --bundles deb
npm run verify:billing
/opt/fleet/lib/verify-url.sh https://caption-salience.sociobot.in <evidence-dir>
```
