# Adversarial first-read review 1

**Verdict: FAIL**

Reviewed `https://caption-salience.sociobot.in` on 2026-08-29 against commit
`2b5ea58b86ba5a3f9495f16c32147aeb97c452c9`. The live JavaScript and CSS
SHA-256 hashes match the clean local production build. There are 36 findings:
6 blocking, 17 major, and 13 minor.

## Findings

### Blocking

#### F-1-1 — Demo mode reads and writes real license storage

- **Quote/location:** The `/demo` banner says “Demo — sample data, nothing is
  saved.” In `src/main.ts:27` real preferences are read before demo mode is
  known. In `src/main.ts:493-499`, the real license token and verdict are read
  on every initial route, including `/demo`; `verifyLicense` then sends the
  token and writes `sb_license:caption-salience:verdict` at lines 459-463.
- **Evidence:** In a fresh browser context, pre-seeding
  `sb_license:caption-salience=review-fake-real-token` and opening `/demo`
  caused a request to
  `https://api.sociobot.in/api/v1/products/caption-salience/verify?license=review-fake-real-token`
  and created a verdict in localStorage. The demo preference controls
  themselves reset correctly and did not overwrite the pre-seeded real
  preferences.
- **Why this fails:** Demo mode is not isolated from real data, and the banner's
  privacy promise is false for returning licensed users.
- **Concrete fix:** Determine demo mode before any storage access. In demo mode,
  skip `acceptReturnedLicense`, stored-license reads, verification requests,
  verdict writes, real preference reads, and profile reads. Add a claim test
  that seeds every real key before loading `/demo`, records requests, exercises
  Reset, and asserts the real namespace is byte-for-byte unchanged.

#### F-1-2 — The SRT half of the import claim is untested

- **Quote/location:** `.factory/claims.json`: “Opens local SRT and WebVTT
  caption files.”
- **Evidence:** `@claim:caption-import` uploads only
  `tests/fixtures/example.vtt` and asserts two cues. It never uploads an SRT
  file.
- **Why this fails:** One advertised format has no claim evidence even though
  the command passes.
- **Concrete fix:** Extend the tagged test with a shipped SRT fixture and
  assert its parsed cues and rendered text, or split the two formats into two
  separately tagged claims.

#### F-1-3 — The caption-file privacy test never opens a caption file

- **Quote/location:** “Caption files stay on this device.”
- **Evidence:** `@claim:local-processing` opens the built-in `/demo` sample,
  presses Play, and checks request origins. It never selects a user caption
  file. The separate import test does not record requests.
- **Why this fails:** The actual operation named by the privacy claim is not
  observed under a request log.
- **Concrete fix:** In the tagged privacy test, upload both shipped SRT and
  WebVTT fixtures, exercise playback and controls, and assert that no request
  contains file content and every request remains explicitly allowed.

#### F-1-4 — The local-audio timing claim is tested with invalid audio and only a status message

- **Quote/location:** `.factory/claims.json`: “Adds local audio for caption
  timing without uploading it.”
- **Evidence:** `@claim:local-audio` uploads the bytes `RIFF fixture`, asserts
  “sample.wav added,” and stops. It does not load playable audio, start it, or
  show that media time drives caption time.
- **Why this fails:** A label can pass while audio playback and synchronization
  are broken.
- **Concrete fix:** Ship a short valid audio fixture, play it, verify current
  time and cue changes track the media, and retain the complete request-log
  assertion.

#### F-1-5 — The paid-profile claim test proves neither five profiles nor ₹499

- **Quote/location:** “Pay ₹499 once to save five named setups.” and the claim
  “A ₹499 one-time license adds up to five named setup profiles.”
- **Evidence:** `@claim:paid-profiles` injects a cached valid verdict, saves one
  profile, and checks `1/5`. It does not save five, reject a sixth, validate the
  ₹499 one-time checkout contract, or verify entitlement activation.
- **Why this fails:** The quantitative and commercial parts of the claim are
  untested.
- **Concrete fix:** Save and load five distinct profiles, assert a sixth cannot
  be saved, and add a recorded billing-contract test for the one-time ₹499
  product and returned entitlement.

#### F-1-6 — The desktop product has no captioned screenshot walkthrough

- **Quote/location:** Landing page after the hero; artifact class is
  `desktop-app`.
- **Evidence:** The landing page contains one atmospheric console illustration,
  one HTML preview, and three text steps. It contains no 3–5 frame screenshot
  walkthrough of the shipped desktop app.
- **Why this fails:** A visitor deciding whether to install cannot verify the
  desktop flow before download; this is a mandatory desktop demo element.
- **Concrete fix:** Add three to five original, captioned app screenshots showing
  opening a file, choosing marks, playing with audio, and the resulting caption
  display. Keep the existing live demo as the one-click path.

### Major

#### F-1-7 — The headline implies personal hearing detection that the product does not perform

- **Quote/location:** Landing h1: “Make hard-to-hear words stand out.”
- **Why this fails:** The app marks source-supplied uncertainty, not the words a
  particular visitor finds hard to hear. The later limitation is more precise
  than the first-screen promise.
- **Concrete fix:** Use “Make uncertain caption words stand out.”

#### F-1-8 — The five-caption demo promise is not in the claim contract

- **Quote/location:** “It opens a timed five-caption conversation.”
- **Why this fails:** This is a quantitative, observable promise with no
  `.factory/claims.json` entry.
- **Concrete fix:** Add a claim that enters from the landing action and asserts
  five realistic timed cues are already visible, or remove the count.

#### F-1-9 — Timer and timeline behavior is an unlisted claim

- **Quote/location:** “Use the timer, timeline, or keyboard to move through each
  cue.”
- **Why this fails:** The keyboard claim covers Space and ArrowRight only. No
  listed claim proves timer-driven progression, timeline seeking, or cue-button
  navigation.
- **Concrete fix:** Add a tagged claim test for all three paths, or narrow the
  sentence to the tested keyboard behavior.

#### F-1-10 — “Every accessibility control” is stronger than the listed free-controls claim

- **Quote/location:** Landing and README: “Playback and every accessibility
  control stay free.” / “Every caption and accessibility control is free.”
- **Why this fails:** `core-free` promises and tests four named controls. It does
  not define or exhaustively test “every accessibility control.”
- **Concrete fix:** Name the free controls in the copy, or expand the claim and
  test to enumerate all controls in unlicensed real mode.

#### F-1-11 — Merchant-of-record status is an unlisted claim

- **Quote/location:** “Sociobot is the merchant of record.”
- **Why this fails:** A buyer can rely on this legal/payment statement, but no
  claim entry verifies the checkout merchant.
- **Concrete fix:** Add a billing-contract claim that verifies the checkout
  merchant, or move the statement to verified terms copy.

#### F-1-12 — Refund handling is an unlisted claim

- **Quote/location:** “Refunds are handled there.”
- **Why this fails:** “There” is vague, and the refund promise has no listed
  verification.
- **Concrete fix:** Write “Request refunds from Sociobot” and add a contract test
  for the linked refund route/policy.

#### F-1-13 — The documented WebVTT annotation formats are unlisted claims

- **Quote/location:** README: “Add `<c.low>word</c>` or
  `<c.conf-42>word</c>` to WebVTT.”
- **Why this fails:** The import claim uses a fixture but does not list or prove
  both documented syntaxes as a claim.
- **Concrete fix:** Add a tagged annotation-syntax claim with fixtures for both
  forms and assert their rendered uncertainty.

#### F-1-14 — The documented SRT annotation format is an unlisted claim

- **Quote/location:** README: “Add `[?word?]` to SRT.”
- **Why this fails:** No listed claim opens an SRT file containing that syntax.
- **Concrete fix:** Add a tagged SRT fixture test and assert only `word` is
  marked uncertain.

#### F-1-15 — The numeric confidence syntax is an unlisted claim

- **Quote/location:** README: “The number in `conf-42` means 42 percent
  confidence.”
- **Why this fails:** No listed test proves numeric parsing or threshold behavior.
- **Concrete fix:** Add boundary fixtures such as 42, 69, and 70 and assert the
  parsed percentage and mark threshold.

#### F-1-16 — The billing-destination privacy claim is unlisted

- **Quote/location:** README: “Checkout and verification use only the Sociobot
  billing API.”
- **Why this fails:** This is a security and data-flow promise without a
  `.factory/claims.json` entry.
- **Concrete fix:** Add a tagged request-log test for checkout and verification,
  including redirects and transmitted fields, or remove “only.”

#### F-1-17 — The release-trigger claim is unlisted

- **Quote/location:** README: “Tags matching `v*` run the release workflow.”
- **Why this fails:** The repository currently supports the statement, but it is
  absent from the claim contract.
- **Concrete fix:** Add a static workflow-contract test under a listed desktop
  release claim.

#### F-1-18 — The cross-platform package claim is unlisted

- **Quote/location:** README: “It builds unsigned macOS, Windows, and Linux
  packages.”
- **Why this fails:** Package availability is a user-facing distribution promise
  without a listed claim.
- **Concrete fix:** Add a release-manifest claim that asserts current artifacts
  for each named platform.

#### F-1-19 — The checksum/manifest release claim is unlisted

- **Quote/location:** README: “The workflow adds `SHA256SUMS` and `latest.json`
  to the GitHub release.”
- **Why this fails:** The statement has no listed claim even though visitors may
  rely on the checksum.
- **Concrete fix:** Add a tagged release-artifact test that downloads and
  validates both files.

#### F-1-20 — The install page's GitHub lookup is unlisted

- **Quote/location:** README: “The installer page reads release metadata from
  the GitHub API.”
- **Why this fails:** This is a network/privacy behavior and needs explicit
  claim coverage.
- **Concrete fix:** Add it to `claims.json` with a request-log test for `/install`.

#### F-1-21 — The installer fallback is unlisted

- **Quote/location:** README: “If the request fails, it links to the release page
  instead.”
- **Why this fails:** No listed test intercepts a failed GitHub request and
  verifies the fallback link.
- **Concrete fix:** Add a tagged failure-path test and assert the resulting URL
  returns successfully.

#### F-1-22 — Route changes are not announced through a route live region

- **Quote/location:** `src/main.ts:245-258` focuses the new h1, but the only
  `aria-live="polite"` element is the changing caption well at line 150.
- **Why this fails:** The route requirement calls for both heading focus and a
  polite route announcement. Focus works; the announcement mechanism is absent.
- **Concrete fix:** Add one persistent route-status live region outside the
  replaced app content and update it with the destination title on every
  `pushState` and `popstate` navigation. Test its announcement text.

#### F-1-23 — Deep routes keep landing-page social metadata

- **Quote/location:** On `/privacy`, `/terms`, `/install`, `/demo`, and the 404,
  `og:title` remains “Caption Salience — Make uncertain words stand out,” and
  the same landing description remains on every route.
- **Why this fails:** Shared deep links describe the landing page rather than
  the page being shared.
- **Concrete fix:** Generate route-specific HTML metadata or update title,
  description, Open Graph, and Twitter fields on route rendering. Add direct
  deep-link assertions.

### Minor

#### F-1-24 — “Control surface” is unexplained jargon

- **Quote/location:** “A local caption control surface.”
- **Why this fails:** A first-time phone visitor should not have to translate
  audio-equipment terminology.
- **Concrete fix:** Rewrite as “A local caption player.”

#### F-1-25 — The hero caption is a metaphorical slogan

- **Quote/location:** “Built like a listening instrument: calm, direct, and
  adjustable.”
- **Why this fails:** “Listening instrument” is metaphor, while “calm” and
  “direct” do not tell the visitor what the product does.
- **Concrete fix:** Delete it, or write “Adjust caption size, uncertainty marks,
  speakers, and chosen terms.”

#### F-1-26 — The preview heading does not name its content

- **Quote/location:** “See what needs a second look.”
- **Why this fails:** It makes no sense in a heading list without the paragraph.
- **Concrete fix:** Rewrite as “Preview the three caption marks.”

#### F-1-27 — “Three controls” mislabels three workflow steps

- **Quote/location:** Eyebrow “Three controls” above “How the player works.”
- **Why this fails:** The items are open, configure, and play steps, not three
  controls.
- **Concrete fix:** Rewrite as “Three steps.”

#### F-1-28 — “Set the signals” is metaphorical UI copy

- **Quote/location:** Step heading “Set the signals.”
- **Why this fails:** The actual action is choosing visible caption marks.
- **Concrete fix:** Rewrite as “Choose caption marks.”

#### F-1-29 — “Play and follow” does not name the result

- **Quote/location:** Step heading “Play and follow.”
- **Why this fails:** It omits what is played and followed.
- **Concrete fix:** Rewrite as “Play the timed captions.”

#### F-1-30 — The paid feature uses inconsistent and vague terms

- **Quote/location:** “Save several setup profiles” followed by “save five named
  setups”; README uses “five named setup profiles.”
- **Why this fails:** “Several,” “setups,” and “setup profiles” refer to the same
  feature.
- **Concrete fix:** Use “Save up to five setup profiles” everywhere.

#### F-1-31 — “Important terms” conflicts with the control name

- **Quote/location:** “Choose text size, an emphasis preset, speakers, and
  important terms.” The preview and player call them “chosen terms.”
- **Why this fails:** Two names make one setting look like two concepts.
- **Concrete fix:** Replace “important terms” with “chosen terms.”

#### F-1-32 — “Paste a license” names an input action, not the result

- **Quote/location:** Landing button “Paste a license.”
- **Why this fails:** It does not say that pasting activates saved profiles.
- **Concrete fix:** Rewrite as “Activate a license.”

#### F-1-33 — The README heading “What works” is contextless

- **Quote/location:** README h2 “What works.”
- **Why this fails:** In a heading list, it does not identify the product area.
- **Concrete fix:** Rewrite as “Caption player features.”

#### F-1-34 — The demo exit action is vague

- **Quote/location:** Demo banner button “Start for real.”
- **Why this fails:** It does not say that the user leaves the sample and arrives
  at an empty player.
- **Concrete fix:** Rewrite as “Leave demo and open captions.”

#### F-1-35 — The 404 h1 uses product metaphor instead of the error

- **Quote/location:** 404 h1 “This panel has no caption.”
- **Why this fails:** The heading does not plainly say the page was not found.
- **Concrete fix:** Use “Page not found”; keep the instrument art as decoration.

#### F-1-36 — Several external links are not announced as external

- **Quote/location:** “Buy a license — ₹499,” “Download for Linux,” and “All
  release files.” Only the Param Factory footer link includes “(external site).”
- **Why this fails:** The site-structure contract requires external links to say
  so, and these links move visitors to Sociobot/Dodo or GitHub.
- **Concrete fix:** Add visible or screen-reader text such as “(external)” and
  consistent external-link treatment to every off-origin link.

## Cold first screen

Fresh Chromium contexts were used before scrolling.

| View | What it appears to do | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Make uncertain or hard-to-hear caption words visually prominent | People who hear some speech and miss words | “Try it with sample data” | Answers all three; wording precision is covered by F-1-7 and F-1-24 |
| 1440 × 900 | Play local captions with visual emphasis | The same partial-hearing audience | “Try it with sample data” | Answers all three |

The mobile first screen also showed all three facts before scrolling. The
desktop screen showed the original console illustration beside the copy.

## Copy audit

Counts are whitespace-delimited visible words; punctuation-only separators are
not treated as prose. No item exceeds 22 words. No attached-skill banned word
appears. Flag IDs identify every jargon, slogan, vague heading, inconsistent
term, or weak button found.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| Caption Salience | 2 | — |
| Demo | 1 | — |
| Player | 1 | — |
| Install | 1 | — |
| Privacy | 1 | — |
| A local caption control surface | 5 | F-1-24 |
| Make hard-to-hear words stand out | 5 | F-1-7 |
| For people who hear some speech and need uncertain words to catch their eye. | 14 | — |
| Try it with sample data | 5 | — |
| It opens a timed five-caption conversation. | 6 | F-1-8 |
| Caption files stay on this device. | 6 | F-1-3 |
| Works offline after the first visit. | 6 | — |
| Core caption controls are free. | 5 | — |
| Built like a listening instrument: calm, direct, and adjustable. | 9 | F-1-25 |
| Live preview | 2 | — |
| See what needs a second look | 6 | F-1-26 |
| Uncertainty appears only when the caption source supplies it. | 9 | — |
| Chosen terms and speaker changes use separate marks. | 8 | — |
| Maya | 1 | — |
| The train leaves from platform fourteen. | 6 | — |
| Supplied uncertainty | 2 | — |
| Chosen term | 2 | — |
| Three controls | 2 | F-1-27 |
| How the player works | 4 | — |
| Open captions | 2 | — |
| Choose an SRT or WebVTT file. | 6 | — |
| You can add local audio for timing. | 7 | F-1-4 |
| Set the signals | 3 | F-1-28 |
| Choose text size, an emphasis preset, speakers, and important terms. | 10 | F-1-31 |
| Play and follow | 3 | F-1-29 |
| Use the timer, timeline, or keyboard to move through each cue. | 11 | F-1-9 |
| Clear limits | 2 | — |
| A player, not a hearing test | 6 | — |
| It does not diagnose hearing loss. | 6 | — |
| It does not extract video or protected captions. | 8 | — |
| It does not invent confidence scores. | 6 | — |
| Optional microphone captions depend on your device speech service. | 9 | — |
| One-time supporter license | 3 | — |
| Save several setup profiles | 4 | F-1-30 |
| Pay ₹499 once to save five named setups. | 8 | F-1-5, F-1-30 |
| Playback and every accessibility control stay free. | 7 | F-1-10 |
| Buy a license — ₹499 | 5 | — |
| Paste a license | 3 | F-1-32 |
| Sociobot is the merchant of record. | 6 | F-1-11 |
| Refunds are handled there. | 4 | F-1-12 |
| Caption emphasis for people who hear some words and miss others. | 10 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| (external site) | 2 | — |
| v0.1.2 · Original generated artwork | 4 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Caption Salience | 2 | — |
| Make uncertain caption words easier to notice. | 7 | — |
| Caption Salience is for people who hear some speech and miss other words. | 13 | — |
| It opens local SRT and WebVTT files. | 7 | F-1-2 |
| The player marks source-supplied uncertainty, speaker changes, and chosen terms. | 10 | — |
| It never invents a confidence score. | 6 | — |
| Try the isolated sample at `/demo`. | 6 | — |
| Demo data stays in memory and is discarded when you leave. | 11 | F-1-1 |
| What works | 2 | F-1-33 |
| Open local SRT and WebVTT caption files. | 7 | F-1-2 |
| Add local audio and use the caption timer. | 8 | F-1-4 |
| Use Space to play and arrow keys to seek. | 9 | — |
| Change caption size and emphasis without a license. | 8 | — |
| Reload the app offline after the first visit. | 8 | — |
| Use optional microphone captions when the device supports speech recognition. | 10 | — |
| Caption and audio files stay on the device. | 8 | F-1-3, F-1-4 |
| The app has no analytics or advertising. | 7 | — |
| See the claim contract for automated evidence. | 7 | — |
| Confidence annotations | 2 | — |
| Caption Salience uses confidence only when the source supplies it. | 10 | — |
| Add `<c.low>word</c>` or `<c.conf-42>word</c>` to WebVTT. | 6 | F-1-13 |
| Add `[?word?]` to SRT. | 4 | F-1-14 |
| The number in `conf-42` means 42 percent confidence. | 8 | F-1-15 |
| Run the site | 3 | — |
| Requirements: Node.js 22 and npm. | 5 | — |
| Open `http://localhost:5173`. | 2 | — |
| The demo is at `http://localhost:5173/demo`. | 5 | — |
| Test and build | 3 | — |
| Playwright 1.58.2 uses the Chromium browser supplied by the factory worker. | 11 | — |
| The static site is written to `dist/site`, with `index.html` at its root. | 12 | — |
| `npm run build` runs the same site build. | 8 | — |
| To check the Tauri shell locally, install Rust and the Tauri 2 system packages, then run: | 16 | — |
| Desktop releases | 2 | — |
| Tags matching `v*` run the release workflow. | 7 | F-1-17 |
| It builds unsigned macOS, Windows, and Linux packages. | 8 | F-1-18 |
| The workflow adds `SHA256SUMS` and `latest.json` to the GitHub release. | 10 | F-1-19 |
| The installer page reads release metadata from the GitHub API. | 10 | F-1-20 |
| If the request fails, it links to the release page instead. | 11 | F-1-21 |
| License | 1 | — |
| Every caption and accessibility control is free. | 7 | F-1-10 |
| A ₹499 one-time supporter license adds up to five named setup profiles. | 12 | F-1-5 |
| Checkout and verification use only the Sociobot billing API. | 9 | F-1-16 |
| The source code is available under the MIT License. | 9 | — |
| Privacy and product notes | 4 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Demo contract | 2 | — |
| Design system and artwork provenance | 5 | — |

The README code blocks are commands rather than sentences and are not counted.
The MIT statement was verified against the checked-in `LICENSE`; build/run
instructions were verified directly and treated as instructions rather than
product claims.

## Demo and sandbox results

- One click from the landing page opens `/demo`.
- The first mobile screen shows the demo banner, app heading, file/audio/mic
  controls, sample status, and the start of a populated caption display.
- The seeded conversation has five realistic Maya/Rowan cues and visible
  uncertainty, speaker, and chosen-term marks.
- Changing size, chosen terms, and time then selecting **Reset demo** restored
  size `44`, terms `fourteen, Cedar Street`, time `00:00 / 00:22`, and five cues.
- Selecting **Start for real** opened an empty `/player` and left the pre-seeded
  real preference value unchanged.
- A clean demo loaded and reloaded offline with only
  `https://caption-salience.sociobot.in` in the request-origin log.
- F-1-1 records the failing pre-existing-license path.

## Claim command results

Each command from `.factory/claims.json` was run separately in a clean clone at
`2b5ea58b86ba5a3f9495f16c32147aeb97c452c9`. Every command exited 0 and each
tagged test passed in Chromium and the 390 px mobile project.

| Claim | Command result |
| --- | --- |
| `caption-import` | PASS — 2 passed |
| `supplied-uncertainty` | PASS — 2 passed |
| `local-processing` | PASS — 2 passed |
| `offline-reload` | PASS — 2 passed |
| `keyboard-playback` | PASS — 2 passed |
| `core-free` | PASS — 2 passed |
| `paid-profiles` | PASS — 2 passed |
| `local-audio` | PASS — 2 passed |
| `microphone-captions` | PASS — 2 passed |
| `local-preferences` | PASS — 2 passed |
| `demo-memory` | PASS — 2 passed |
| `no-hearing-diagnosis` | PASS — 2 passed |
| `no-caption-extraction` | PASS — 2 passed |
| `no-invented-confidence` | PASS — 2 passed |
| `no-tracking` | PASS — 2 passed |

Passing commands do not clear F-1-1 through F-1-5 because those findings cover
untested paths or incomplete assertions.

## Structure, accessibility, links, and build

- `/`, `/demo`, `/player`, `/install`, `/privacy`, and `/terms` returned 200.
  A made-up route returned 404 and rendered the styled 404 page.
- Every checked route had `lang="en"`, one h1, one main landmark, a canonical
  URL, and a route-specific title of at most 49 characters.
- Client navigation focused the destination h1. Back restored the prior landing
  scroll position. F-1-22 records the missing route live region.
- The favicon, apple-touch icon, manifest, robots file, sitemap, Open Graph
  image, and security headers exist. F-1-23 records stale deep-route metadata.
- All internal and external links discovered on the routes resolved successfully,
  including the live Linux AppImage. F-1-36 records missing external-link copy.
- The live `verify-url.sh` check passed with no landing-page console errors.
- Playwright + axe reported zero violations on all six real routes at 390 px.
  Keyboard/focus, 44 px targets, reduced-motion CSS, and mobile overflow checks
  also passed in the repository suite.
- The visual identity is distinct: matte charcoal, parchment, brass, orange and
  mint; serif captions; clipped instrument panels; and original mid-century
  console artwork match `.factory/design.md`. It does not resemble the generic
  centered-gradient/three-card SaaS pattern.
- `npm test`: PASS — 4 unit tests and 42 end-to-end tests passed; 2
  desktop-project skips correspond to mobile-only checks.
- `npm run build`: PASS — `dist/site` produced 27.29 kB JavaScript (9.72 kB
  gzip), 18.11 kB CSS, and hashed assets.

## History

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. The
earlier `.factory/handoff.md` declared a verification PASS and identified no
finding IDs. Its stated deployed candidate was checked again: the live asset
hashes match the clean build, every declared command passes, routes and links
work, and accessibility checks pass. The new defects above were reproduced from
scratch and were not cleared by the earlier handoff.

## Missed leverage

No additional AI, sync, import, or export feature is required by the brief.
SRT/WebVTT import and local audio are already the core path. Cloud transcription
would conflict with the local-first design and the brief's cloud-transcription
non-goal unless introduced as a clearly optional, separately justified feature.

## What would make this perfect

Resolve every finding above, especially the real-license demo leak and the four
incomplete claim tests. Add the desktop screenshot walkthrough, register and
test every remaining public claim, replace the flagged copy, add route
announcements and route-specific share metadata, then repeat the entire cold
mobile/desktop, demo, claim, crawl, accessibility, offline, build, and history
review from a clean state. PASS requires that rerun to produce zero findings.
