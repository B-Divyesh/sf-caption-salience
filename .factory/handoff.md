# Caption Salience repair handoff — 2026-08-28

## Result

The three findings from independent verification 3 for candidate `13ca7bf7179f7b03315659951cc697b45fdb4011` are repaired in product commit `5fbad962129606e4d194dba0a6d0008ea10e7f7d` and released from `968407597c6ee0cb1ed5bc247b88769988e946ec` as desktop app version `0.1.2`. This remains a Tauri 2 desktop app with its static companion site and GitHub Actions release workflow.

## Repairs

1. **Visible import focus:** each file input now lives inside its visible label. `.file-label:focus-within` draws the product's 3px brass signal outline around the real Open SRT/WebVTT or Add local audio control when Tab focuses its clipped input. The direct Playwright regression tabs from the player heading, asserts the actual input focus, and asserts the 3px visible label outline for both imports at desktop and 390px.
2. **Route focus and scroll:** client navigation stores the departing entry's scroll position, creates a new history entry at zero, then focuses the destination heading without allowing focus to move the viewport. Back/forward restore only the saved history entry position. The regression starts at the scrolled footer, follows Privacy, verifies its focused heading is fully visible at `scrollY=0`, then verifies Back restores the old position.
3. **Fresh desktop-release provenance:** all product version sources are `0.1.2`. The static build writes `release-identity.json` with the package version and source commit. Tauri embeds the hashed static assets, including this identity, in each native package; this makes a released package verifiable against its source rather than merely against a release tag. The production-build regression validates the emitted identity and asset/cache contract.

## Verification performed

```sh
npm ci                         # 63 packages; 0 vulnerabilities
npx tsc --noEmit               # passed
npm test                        # 4 Vitest + 42 Playwright passed; 2 desktop-only mobile skips
npm run build                   # passed; dist/site created
npm run verify:billing          # ₹499 registration and Dodo redirect passed
sh -n public/install.sh         # passed
cargo check --manifest-path src-tauri/Cargo.toml  # passed
cargo test --manifest-path src-tauri/Cargo.toml   # passed; 0 Rust tests defined
CI=true npx tauri build --bundles deb              # passed
```

- The full browser suite runs all 15 claim-tagged flows in both Chromium desktop and the 390×844 mobile project. It includes same-origin/local-file checks, offline demo reload, keyboard playback, demo isolation, mobile no-overflow and 44px persistent target checks, and Axe serious/critical checks.
- The built site emits `app-CuTsQjMP.js` (27,286 bytes raw, 9.72 KB gzip) and `app-tXa-ZJPb.css` (18,111 bytes raw, 4.73 KB gzip). `dist/site/release-identity.json` names version `0.1.2` and release commit `968407597c6ee0cb1ed5bc247b88769988e946ec`.
- A local release-mode Debian package was built at `src-tauri/target/release/bundle/deb/Caption Salience_0.1.2_amd64.deb`; SHA-256 `69b7e287bd7a0cc7361642689ea769609f005c70588c7442a9658c4c85292678`. Its extracted app binary contains the new hashed `app-CuTsQjMP.js` resource and `/release-identity.json`; it stayed running for an 8-second Xvfb smoke launch.
- Local AppImage assembly reaches the Tauri `linuxdeploy` phase but fails in this container (`failed to run linuxdeploy`), including with `APPIMAGE_EXTRACT_AND_RUN=1`. The committed GitHub Actions Ubuntu release job builds the same target on the supported runner; it must publish and be inspected before treating the release as complete.

## Deployment and release status

Deployed `dist/site` with `/opt/fleet/lib/deploy-static.sh caption-salience dist/site`.

- Static Web App deployment ID: `98179642-6af4-4278-956a-5df23a9767c1`; live URL: <https://caption-salience.sociobot.in>.
- Live `release-identity.json` is version `0.1.2`, commit `968407597c6ee0cb1ed5bc247b88769988e946ec`. `verify-url.sh` passed at 909 ms with no console/page errors, one title/language/main/H1, and no missing image alt text or unlabeled button. The deployed hashed JS has immutable one-year caching and the expected CSP.
- Live keyboard exercise: both first file actions received Tab focus on their actual inputs and computed `rgb(255, 180, 75) solid 3px` visible label outlines. A scrolled-footer Privacy navigation reset to `scrollY=0`, focused the heading, and placed it from 215px to 402px in a 900px viewport.
- GitHub Actions release run [33197104423](https://github.com/B-Divyesh/sf-caption-salience/actions/runs/33197104423) passed all macOS (arm64/x64), Windows, Ubuntu, and manifest jobs. Public release `v0.1.2` targets commit `9684075` and includes DMG, MSI/EXE, AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- Downloaded public `Caption.Salience_0.1.2_amd64.deb` and verified it against the public `SHA256SUMS`; its extracted binary contains `app-CuTsQjMP.js` and `/release-identity.json`. Live `/install` resolves `v0.1.2` for Linux and links its new AppImage without console errors.

## Operator notes

- Desktop builds remain unsigned. macOS signing/notarization needs `APPLE_CERTIFICATE` and the related Apple secrets; Windows signing needs `WINDOWS_CERT_PFX` and its password.
- PowerShell is unavailable in this Linux worker, so `public/install.ps1` was not executed here. Its shell counterpart passed syntax validation.
