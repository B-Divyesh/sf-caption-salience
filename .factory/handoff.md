# Independent verification 3 handoff — FAIL

## Result

**FAIL** for candidate `13ca7bf7179f7b03315659951cc697b45fdb4011` at <https://caption-salience.sociobot.in>, independently verified on 2026-08-28. Product code was not modified. Full evidence and reproduction details are in `.factory/verification-3.md`.

## Release blockers

- **P1 — stale desktop release:** `/install` downloads `v0.1.1`, built by its successful release run from `c103c109…`, not the candidate. The published binary embeds old `/assets/app.js` and `/assets/app.css` paths and predates the candidate's UI/mobile repairs.
- **P1 — invisible primary keyboard focus:** on `/player`, the first two Tab stops are clipped 1×1px file inputs. Their visible Open/Add labels show no outline, so keyboard users cannot see which import action is active.
- **P2 — off-screen route focus:** navigating from a scrolled footer to Privacy leaves the newly focused `<h1>` completely above the viewport.

## What passed

- Mandatory cold first-read and one-click sample demo.
- All 15 claim commands after `npm ci`, in desktop and 390px mobile projects.
- `npm ci` (0 vulnerabilities), `npx tsc --noEmit`, `npm test` (4 unit + 38 browser passed; 2 expected mobile-only skips), `npm run build`, billing verification, shell syntax, `cargo check`, and `cargo test` (0 Rust tests defined).
- Live static files byte-match the candidate build.
- Normal/invalid caption import and recovery, 28/72px boundaries, playback keys, local audio, demo reset/exit, preference persistence, and microphone fixture.
- Live Axe: 0 serious/critical issues on all main routes and 404 at desktop and 390px. Mobile has no overflow and required persistent targets are at least 44px. Reduced motion works.
- Mobile Lighthouse: 96 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.3s and CLS 0.
- Same-origin caption/demo traffic, expected GitHub-only install request, security headers, immutable hashed assets, real 404, active versioned service worker, and offline demo reload.
- Billing checkout redirects to Dodo. API burst observed 30×200 then 50×429 with `Retry-After: 4`.
- The public release has all three platform families and valid manifests/checksums. The live Linux installer verified and installed its AppImage in a temporary directory; the extracted DEB smoke-launched under Xvfb. Those artifacts are installable but stale.

## Verification commands

```sh
npm ci
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
# Run every printed claim command independently.
npx tsc --noEmit
npm test
npm run build
npm run verify:billing
sh -n public/install.sh
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

Tauri checks on Linux require the packages declared in `.github/workflows/release.yml`. There is no lint script. PowerShell was unavailable, so `install.ps1` was inspected but not executed.

## Next steps

1. Repair visible focus for both file controls and route scroll/focus behavior; add direct regressions.
2. Tag the repaired accepted commit and let the GitHub workflow publish fresh macOS, Windows, and Linux packages.
3. Extract one fresh package and confirm it embeds the candidate hashed assets/build identity.
4. Repeat the complete independent verification before release.
