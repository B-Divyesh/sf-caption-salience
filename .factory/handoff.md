# Caption Salience polish round 1 handoff

Polish round 1 closes all 36 findings in `.factory/review-1.md`. No earlier review or polish files exist. The static site is deployed at <https://caption-salience.sociobot.in>, and the Tauri desktop app remains the product artifact.

## What changed

- Rewrote the first screen and every flagged label in plain words while retaining the acoustic instrument-panel design.
- Made `/?demo=1` the one-click sample entry. Demo mode is selected before storage access, ignores real licenses and preferences, makes no verification request, and clears its file/audio state on reset or exit.
- Expanded `.factory/claims.json` to 21 claims with exactly one tagged test each. Tests now exercise both caption formats, actual caption-file privacy, playable WAV timing, all five profiles and the sixth-profile limit, billing requests, annotation boundaries, release files, and installer fallback.
- Added three original captioned screenshots of the built desktop interface.
- Added route announcements and route-specific title, description, canonical, Open Graph, and Twitter metadata in both runtime navigation and generated deep-route HTML.
- Repaired 404 wording, external-link labels, legal wording, mobile first-screen coverage, and all terminology issues.
- Bumped the app to 0.1.3 and published tag `v0.1.3` for the macOS, Windows, and Linux release workflow.

The exact finding-by-finding map is in `.factory/polish-1.md`. Demo details are in `.factory/demo.md`; the reviewed copy and terminology are in `.factory/copy-audit.md`.

## Verification

Run from Node.js 22 with Playwright 1.58.2:

```sh
npm ci
npx tsc --noEmit
npm test
npm run build
npm run verify:billing
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
CI=true npx tauri build --bundles deb
```

Results:

- Fresh clone `/tmp/caption-salience-clean-RMkMvj`: all 21 exact claim commands passed, with two browser-project passes per claim.
- Full suite: 4 Vitest tests passed; Playwright reported 59 passes and 3 expected desktop skips across 62 checks.
- Build: `dist/site/` produced 30.58 kB JavaScript (10.40 kB gzip) and 18.73 kB CSS (4.85 kB gzip).
- Native: Cargo check/tests passed; `Caption Salience_0.1.3_amd64.deb` built at 3,059,170 bytes. The app stayed running under Xvfb for eight seconds with no stderr.
- Billing: the registered ₹499 checkout returned a Dodo session redirect.
- Live `verify-url.sh`: 859 ms load, no console errors, valid title/lang/h1/main/image-alt/button-name checks.
- Live/local application JavaScript SHA-256 matched at `75611b79be015b69697da65f3ce476264272c8ae9851d56cc89b0bac516766e7`; `release-identity.json` reports app 0.1.3 and repair commit `d8d3033d81161fd6e5c525d56b7f0812a29709a0`.
- Live Axe CLI: zero violations on five tested routes.
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.2 s, CLS 0, TBT 20 ms.
- Cold live browser audit: isolated seeded demo, Reset, exit, SRT import, valid local-audio timing, all route metadata, 390px overflow, and real 404 status passed.
- Release run `33231124503` succeeded. Public `v0.1.3` contains nine macOS/Windows/Linux packages, `latest.json`, and `SHA256SUMS`. The downloaded DEB matched SHA-256 `41d20a7d46d15e323c322217a09bf3f0526294b112a2fcbe9b051305a5d5fabe`.

Evidence is under `.factory/evidence/polish-1/`.

## Deployment and release

- Static deploy: `/opt/fleet/lib/deploy-static.sh caption-salience dist/site` succeeded.
- Public site: <https://caption-salience.sociobot.in>.
- Release workflow: <https://github.com/B-Divyesh/sf-caption-salience/actions/runs/33231124503>.
- Desktop release: <https://github.com/B-Divyesh/sf-caption-salience/releases/tag/v0.1.3>.

## Known gaps

None in the requested scope.

## Needs operator action

The published desktop packages are intentionally unsigned. Apple notarization and Windows Authenticode require owner certificates (`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`) if signed packages are desired later.
