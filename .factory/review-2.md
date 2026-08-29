# Adversarial first-read review 2

**Verdict: PASS**

Reviewed 2026-08-29 against `ac095c0824d30f408fc0771c09cfed3dcc578efe` and the live site. Zero findings: no blocking, major, or minor items, and no untested listed claim.

## Cold first screen

| View | What it does | For whom | First action |
| --- | --- | --- | --- |
| 390 × 844 | Marks supplied uncertainty, speakers, and chosen terms in local captions | People who hear some speech and miss words | Try it with sample data |
| 1440 × 900 | The same local caption player | The same audience | Try it with sample data |

The first mobile screen states the job, audience, action, and immediate result: “Make uncertain caption words stand out”; “For people who hear some speech and need uncertain words to catch their eye.”; and “See five timed captions with the three marks already applied.” It also shows all three facts. Fresh live request logs had only same-origin requests and no console errors.

## Copy audit

Counts are whitespace-delimited. Every visible prose sentence, heading, and action is at most 22 words. No jargon, marketing adjective, mood heading, inconsistent term, or non-result-naming action was found; therefore no rewrite is proposed.

### Landing page

| Copy | Words |
| --- | ---: |
| A local caption player | 5 |
| Make uncertain caption words stand out | 6 |
| For people who hear some speech and need uncertain words to catch their eye. | 14 |
| Try it with sample data | 5 |
| See five timed captions with the three marks already applied. | 10 |
| Caption and audio files stay on this device. | 8 |
| Works offline after the first visit. | 6 |
| Size and caption marks stay free. | 6 |
| Adjust caption size, uncertainty marks, speakers, and chosen terms. | 9 |
| Live preview | 2 |
| Preview the three caption marks | 5 |
| Uncertainty appears only when the caption source supplies it. | 9 |
| Chosen terms and speaker changes use separate marks. | 8 |
| The train leaves from platform fourteen. | 6 |
| Supplied uncertainty | 2 |
| Chosen term | 2 |
| Desktop walkthrough | 2 |
| See the caption player in use | 6 |
| 1. Open an SRT or WebVTT file. | 7 |
| Its timed cues fill the caption timeline. | 7 |
| 2. Choose caption size, uncertainty, speaker, and chosen-term marks. | 8 |
| 3. Add local audio, then play or seek through the timed captions. | 11 |
| Three steps | 2 |
| How the player works | 4 |
| Open captions | 2 |
| Choose an SRT or WebVTT file. | 6 |
| You can add local audio for timing. | 7 |
| Choose caption marks | 3 |
| Choose text size, an emphasis preset, speakers, and chosen terms. | 10 |
| Play the timed captions | 4 |
| Use Play, the timeline, cue buttons, or keyboard shortcuts to change cues. | 12 |
| Clear limits | 2 |
| A player, not a hearing test | 6 |
| It does not diagnose hearing loss. | 6 |
| It does not extract video or protected captions. | 8 |
| It does not invent confidence scores. | 6 |
| Optional microphone captions depend on your device speech service. | 9 |
| One-time supporter license | 3 |
| Save up to five setup profiles | 6 |
| Pay ₹499 once to save up to five named setup profiles. | 10 |
| Size, uncertainty, speaker, and chosen-term controls stay free. | 8 |
| Buy a license — ₹499 (external) | 6 |
| Activate a license | 3 |
| Sociobot is the merchant of record. | 6 |
| Request refunds from Sociobot. | 4 |
| Caption emphasis for people who hear some words and miss others. | 10 |
| Built by Param Factory (external) | 6 |
| Original generated artwork and app screenshots | 6 |

### README

| Copy | Words |
| --- | ---: |
| Caption Salience | 2 |
| Make uncertain caption words easier to notice. | 7 |
| Caption Salience is for people who hear some speech and miss other words. | 13 |
| It opens local SRT and WebVTT files. | 7 |
| The player marks source-supplied uncertainty, speaker changes, and chosen terms. | 10 |
| It never invents a confidence score. | 6 |
| Try the isolated sample at `/?demo=1`. | 6 |
| It opens five timed cues. | 5 |
| Demo data stays in memory and never reads or changes real preferences, profiles, or licenses. | 15 |
| Caption player features | 3 |
| Open local SRT and WebVTT caption files. | 7 |
| Add local audio to drive caption timing. | 7 |
| Use Space to play and arrow keys to seek. | 9 |
| Change caption size and emphasis without a license. | 8 |
| Reload the app offline after the first visit. | 8 |
| Use optional microphone captions when the device supports speech recognition. | 10 |
| Caption and audio files stay on the device. | 8 |
| The app has no analytics, advertising, accounts, or tracking cookies. | 10 |
| See the claim contract for automated evidence. | 7 |
| Confidence annotations | 2 |
| Caption Salience uses confidence only when the source supplies it. | 10 |
| Add `<c.low>word</c>` or `<c.conf-42>word</c>` to WebVTT. | 6 |
| Add `[?word?]` to SRT. | 4 |
| The number in `conf-42` means 42 percent confidence. | 8 |
| Run the site | 3 |
| Requirements: Node.js 22 and npm. | 5 |
| Open `http://localhost:5173`. | 2 |
| The demo is at `http://localhost:5173/demo`. | 5 |
| Test and build | 3 |
| Playwright 1.58.2 uses the Chromium browser supplied by the factory worker. | 11 |
| The static site is written to `dist/site`, with `index.html` at its root. | 12 |
| `npm run build` runs the same site build. | 8 |
| To check the Tauri shell locally, install Rust and the Tauri 2 system packages, then run: | 16 |
| Desktop releases | 2 |
| Tags matching `v*` run the release workflow. | 7 |
| It builds unsigned macOS, Windows, and Linux packages. | 8 |
| Each release includes `SHA256SUMS` and `latest.json`. | 6 |
| The installer page reads release metadata from the GitHub API. | 10 |
| If the request fails, it links to the release page instead. | 11 |
| License | 1 |
| Caption size, uncertainty, speaker, and chosen-term controls are free. | 8 |
| A ₹499 one-time Sociobot license adds up to five named setup profiles. | 12 |
| License checks use the Sociobot billing API. | 7 |
| The source code is available under the MIT License. | 9 |
| Privacy and product notes | 4 |

README commands and link labels are instructions/navigation, not sentences. Terminology is consistent: caption file, cue, uncertainty, chosen term, setup profile, and demo.

## Demo and sandbox

The first click entered `/?demo=1` and immediately showed five realistic Maya/Rowan timed cues, source-supplied uncertainty, speaker and chosen-term marks, and the persistent banner “Demo — sample data, nothing is saved.”

In a fresh 390 px context seeded with real preference, profile, license, and verdict keys, the demo used its 44 px default. After changing size and cue, **Reset demo** restored 44 px, `00:00 / 00:22`, and five cues. **Leave demo and open captions** opened the empty real player. Every seeded real key remained byte-for-byte unchanged and the request log had no off-origin request.

## Claims

All 21 commands from `.factory/claims.json` were run separately after `npm ci` in fresh clone `/tmp/caption-salience-review-2-aWl3th`. Each passed in Chromium and the 390 px project:

`caption-import`, `supplied-uncertainty`, `local-processing`, `offline-reload`, `keyboard-playback`, `playback-navigation`, `core-free`, `paid-profiles`, `billing-data-flow`, `local-audio`, `microphone-captions`, `local-preferences`, `demo-isolation`, `demo-five-cues`, `annotation-syntax`, `no-hearing-diagnosis`, `no-caption-extraction`, `no-invented-confidence`, `no-tracking`, `desktop-release`, and `installer-release-resolution`.

The full suite passed: 4 unit tests and 59 browser tests, with 3 expected desktop-project skips for mobile-only geometry checks. `npm run build` passed and produced `dist/site`; the JavaScript entry is 30.58 kB raw / 10.40 kB gzip. Landing/demo request logs, offline reload, uploaded-file privacy, local audio, and demo isolation are all covered by the independent checks. All landing and README claim-like copy has a claims entry; no unlisted claim was found.

## Structure, accessibility, links, and visual identity

- `/`, `/?demo=1`, `/demo`, `/player`, `/install`, `/privacy`, and `/terms` returned 200. A made-up route returned a real 404 with the designed **Page not found** screen and return-home action.
- Each direct response had one h1, main landmark, `lang="en"`, a route-specific title, description, canonical URL, Open Graph/Twitter metadata, and favicon. Client navigation focuses the h1, updates the polite route-status region, and Back restores scroll.
- Header/footer are consistent. Every discovered internal/external HTTP link resolved 200; the support link is explicitly `mailto:`. Sitemap, robots, manifest, and security headers are present.
- The full suite's axe, focus, touch-target, overflow, and reduced-motion checks passed. No live console error was observed.
- The identity is distinct and matches `.factory/design.md`: charcoal/parchment/brass instrument panels, orange/mint signals, original console art, live HTML preview, and three captioned product screenshots—not a generic SaaS template.

## Earlier-history verification

All earlier `.factory/review-*.md`, `.factory/polish-*.md`, handoff, and verification records were read. Each F-1 finding was checked again live and in source/tests:

| Finding IDs | Confirmation |
| --- | --- |
| F-1-1 | Seeded demo storage/request log passes; demo avoids real storage and licenses. |
| F-1-2 | Import claim uploads and renders both SRT and WebVTT fixtures. |
| F-1-3 | Privacy claim uploads both formats under a request log. |
| F-1-4 | Valid WAV playback drives caption timing without upload. |
| F-1-5 | ₹499 fixture, five profiles, sixth rejection, and revoked access are tested. |
| F-1-6 | Three captioned desktop walkthrough screenshots are live. |
| F-1-7 | Live h1 names uncertain caption words, not personal hearing detection. |
| F-1-8 | Landing click and five sample cues are tested. |
| F-1-9 | Timer, timeline, cue buttons, and keyboard playback are tested. |
| F-1-10 | Free controls are named and tested. |
| F-1-11 | Merchant wording is covered by the paid contract test. |
| F-1-12 | Refund action names Sociobot and has a direct support address. |
| F-1-13 | WebVTT low/numeric annotation forms are tested. |
| F-1-14 | SRT question-tag annotation is tested. |
| F-1-15 | 42/69/70 confidence boundary is tested. |
| F-1-16 | Unsupported broad billing wording was removed; exact verification flow is tested. |
| F-1-17 | The `v*` release trigger is tested. |
| F-1-18 | Current macOS, Windows, and Linux artifacts are tested. |
| F-1-19 | Release checksums and manifest are tested. |
| F-1-20 | Installer GitHub API request is tested. |
| F-1-21 | Installer failure fallback is tested. |
| F-1-22 | Persistent polite route announcement is live and tested. |
| F-1-23 | Static and live deep-route metadata are route-specific. |
| F-1-24 | Eyebrow is “A local caption player.” |
| F-1-25 | Hero caption names adjustable properties. |
| F-1-26 | Preview heading names the caption marks. |
| F-1-27 | Workflow eyebrow says “Three steps.” |
| F-1-28 | Workflow step says “Choose caption marks.” |
| F-1-29 | Workflow step says “Play the timed captions.” |
| F-1-30 | Paid wording consistently says “up to five setup profiles.” |
| F-1-31 | “Chosen terms” is consistent throughout. |
| F-1-32 | License action says “Activate a license.” |
| F-1-33 | README heading is “Caption player features.” |
| F-1-34 | Demo exit names its destination and opens empty player. |
| F-1-35 | 404 h1 is “Page not found.” |
| F-1-36 | Off-origin links visibly say “(external).” |

## Missed leverage

No extra AI, export, import, or sync feature is implied by the brief. Local SRT/WebVTT import and local audio cover the job; cloud transcription or decorative AI would conflict with the stated local-first, source-supplied-confidence scope.

## What would make this perfect

Nothing further was found in this round. Future changes to copy, storage, billing, release behavior, or routes should retain the claim contract and repeat this complete cold, sandbox, crawl, accessibility, and history review.

