# Perfection-loop polish 1

Release candidate `2cccd021ffa11a5f7ac3d606033cbd6f88a35665` was repaired from review commit `38e99129d70dc0c40d7d90fc71218b74bca1a399`. Product repair commit: `d8d3033d81161fd6e5c525d56b7f0812a29709a0`.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo mode is detected before any storage access. It skips returned/stored licenses, verification, real preferences, and profiles. Reset and exit clear demo audio and cues. | `@claim:demo-isolation`; live `/?demo=1&license=ignored`; `.factory/evidence/polish-1/live-demo-mobile.png` |
| F-1-2 | The import claim now uploads and renders shipped SRT and WebVTT fixtures. | `@claim:caption-import`; `tests/fixtures/example.srt`; `tests/fixtures/example.vtt` |
| F-1-3 | The privacy test now uploads both formats, plays, seeks, adjusts controls, and checks request URLs and file-content leakage. | `@claim:local-processing` |
| F-1-4 | Replaced invalid bytes with a six-second PCM WAV. The test plays it, moves media time across a cue boundary, and checks synchronized caption time plus requests. | `@claim:local-audio`; `tests/fixtures/timing.wav` |
| F-1-5 | Recorded the ₹499 one-time contract and entitlement response. The test saves and loads five distinct profiles, blocks a sixth, then proves revoked access locks saving. | `@claim:paid-profiles`; `tests/fixtures/billing-contract.json`; `npm run verify:billing` |
| F-1-6 | Added three captioned screenshots captured from the built desktop interface: file opened, marks adjusted, and audio-driven playback. | `landing includes three captioned desktop screenshots…`; `public/assets/walkthrough-*.webp` |
| F-1-7 | Replaced the headline with “Make uncertain caption words stand out.” | 390px and 1440px screenshots in `.factory/evidence/polish-1/` |
| F-1-8 | Registered and tested the five-cue one-click sample promise. | `@claim:demo-five-cues`; live `/?demo=1` |
| F-1-9 | Registered and tested timer movement, timeline seeking, cue-button seeking, and keyboard navigation. | `@claim:playback-navigation`; `@claim:keyboard-playback` |
| F-1-10 | Replaced “every accessibility control” with the four named free controls. | `@claim:core-free`; live `/` and `/terms` |
| F-1-11 | Kept merchant wording in terms and registered it in the paid contract. | `@claim:paid-profiles`; live `/terms` |
| F-1-12 | Replaced the vague refund sentence with “Request refunds from Sociobot” and a direct mail link; revoked entitlement is tested. | `@claim:paid-profiles`; live `/terms` |
| F-1-13 | Added fixtures and assertions for WebVTT `<c.low>` and `<c.conf-42>` syntax. | `@claim:annotation-syntax`; `tests/fixtures/annotations.vtt` |
| F-1-14 | Added an SRT `[?word?]` fixture and rendered uncertainty assertion. | `@claim:annotation-syntax`; `tests/fixtures/example.srt` |
| F-1-15 | Added 42, 69, and 70 percent boundary cases; only values below 70 percent render as uncertain. | `@claim:annotation-syntax` |
| F-1-16 | Removed the unsupported broad “checkout and verification use only” wording. Added an exact GET/query/body request test for verification. | `@claim:billing-data-flow` |
| F-1-17 | Registered the `v*` release trigger and asserted it from the workflow. | `@claim:desktop-release` |
| F-1-18 | Registered and checked current macOS, Windows, and Linux release assets. | `@claim:desktop-release`; GitHub release `v0.1.3` |
| F-1-19 | The claim test downloads `latest.json` and `SHA256SUMS`, checks four platform entries, and matches every named file to a checksum. | `@claim:desktop-release` |
| F-1-20 | Registered and recorded the Install page's exact GitHub API request. | `@claim:installer-release-resolution`; live `/install` |
| F-1-21 | The test forces a 503, checks the calm fallback, and verifies the release-page URL returns successfully. | `@claim:installer-release-resolution` |
| F-1-22 | Added a persistent polite route-status region and updates on navigation and history changes. | `client navigation reveals…`; live route cold-check |
| F-1-23 | Runtime routing now updates description, canonical, Open Graph, and Twitter metadata. Static deep-route HTML is generated with the same route-specific metadata. | `deep routes expose their own titles…`; `release build hashes…`; live `/privacy`, `/terms`, `/install`, `/demo` |
| F-1-24 | Replaced “control surface” with “local caption player.” | `.factory/copy-audit.md`; live `/` |
| F-1-25 | Replaced the metaphorical hero caption with the four adjustable caption properties. | `.factory/copy-audit.md`; live `/` |
| F-1-26 | Renamed the preview heading to “Preview the three caption marks.” | `.factory/copy-audit.md`; live `/` |
| F-1-27 | Renamed “Three controls” to “Three steps.” | `.factory/copy-audit.md`; live `/` |
| F-1-28 | Renamed “Set the signals” to “Choose caption marks.” | `.factory/copy-audit.md`; live `/` |
| F-1-29 | Renamed “Play and follow” to “Play the timed captions.” | `.factory/copy-audit.md`; live `/` |
| F-1-30 | Standardized paid feature wording as “up to five setup profiles.” | `@claim:paid-profiles`; live `/` and `/terms` |
| F-1-31 | Standardized “chosen terms” throughout. | `.factory/copy-audit.md`; live `/` |
| F-1-32 | Renamed the restore action to “Activate a license.” | `.factory/copy-audit.md`; live `/` |
| F-1-33 | Renamed the README heading to “Caption player features.” | `README.md` |
| F-1-34 | Renamed the demo exit to “Leave demo and open captions” and verified it opens an empty real player. | `@claim:demo-isolation`; live `/?demo=1` |
| F-1-35 | Replaced the 404 headline with “Page not found.” | `deep routes expose their own titles…`; live `/cold-missing-page` returns HTTP 404 |
| F-1-36 | Added a visible “(external)” label and `rel="external"` to checkout, release, download, and Param Factory links. | `landing includes three captioned desktop screenshots and labels every external link`; live `/` and `/install` |

## Verification evidence

- Every one of the 21 exact `.factory/claims.json` commands passed from fresh clone `/tmp/caption-salience-clean-RMkMvj`; each produced 2 browser passes.
- Full suite: 4 Vitest tests passed; Playwright ran 62 checks with 59 passes plus 3 expected desktop skips for mobile-only geometry.
- `npm run build`: JS 30.58 kB raw / 10.40 kB gzip; CSS 18.73 kB raw / 4.85 kB gzip.
- `cargo check`, `cargo test`, and `CI=true npx tauri build --bundles deb` passed. The 0.1.3 DEB is 3,059,170 bytes; the native app ran for an eight-second smoke window with no stderr.
- Local Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 20 ms.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 20 ms.
- Axe CLI 4.10.3: zero violations across `/`, `/?demo=1`, `/privacy`, `/terms`, and `/install`.
- Live `verify-url.sh`: 859 ms, no console errors, one h1, `lang=en`, main landmark, all image alt text, all buttons named.
- Live and local JavaScript both have SHA-256 `75611b79be015b69697da65f3ce476264272c8ae9851d56cc89b0bac516766e7`; live identity reports app 0.1.3 at repair commit `d8d3033d81161fd6e5c525d56b7f0812a29709a0`.
- Screenshots: `.factory/evidence/polish-1/home-desktop.png`, `home-mobile.png`, `demo-mobile.png`, and `live-demo-mobile.png`.
- Live URL: <https://caption-salience.sociobot.in>.
- Release workflow `33231124503`: success. Public `v0.1.3` has nine platform packages plus `latest.json` and `SHA256SUMS`; the downloaded DEB matched SHA-256 `41d20a7d46d15e323c322217a09bf3f0526294b112a2fcbe9b051305a5d5fabe`.
