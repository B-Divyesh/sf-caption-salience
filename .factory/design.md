# Caption Salience visual thesis

## Direction

Caption Salience uses a **mid-century acoustic instrument panel**: a warm, matte desktop surface; cream labels; dark meter wells; brass controls; and a single safety-orange signal. It borrows the legibility and honest controls of 1950s laboratory audio gear without imitating a specific brand. This fits a tool whose job is careful listening, calibration, and trust.

The interface is intentionally single-mode. The dark walnut-and-ink treatment limits glare around bright captions and makes emphasis readable in low light.

## Tokens

- `--ink: #171a18` — page background.
- `--panel: #242824` — raised instrument face.
- `--well: #0d100f` — caption and meter wells.
- `--paper: #f4edda` — primary text and painted labels (13.6:1 on panel).
- `--muted: #c4baa2` — secondary text (7.4:1 on panel).
- `--signal: #ffb44b` — focus, uncertainty, and active state.
- `--signal-ink: #211404` — text on signal.
- `--mint: #9fd4b1` — success and speaker cues.
- `--danger: #ff8f7e` — errors.
- `--brass: #8b7448` — borders and hardware.

## Typography

- Display and controls: `Trebuchet MS`, `Avenir Next`, system sans. Its open, engineered shapes read like panel lettering.
- Captions and body: `Georgia`, `Charter`, serif. The broad forms separate word shapes and stay readable at large caption sizes.
- No web fonts are loaded. The system stacks avoid network requests and remain legible offline.

Type steps: 14, 16, 20, 26, 40, and a user-controlled caption range of 28–72 px. Body text is at least 16 px with 1.55 line height.

## Space, shape, and layout

An 8 px base unit drives spacing: 8, 16, 24, 32, 48, 64. Panels use clipped upper corners, 2 px brass rules, inset shadows, and small round fasteners. Controls are rectangular with 4 px corners and at least 44 px targets. The live caption well remains the visual center. At 390 px, secondary explanation stacks below the player; nothing required disappears.

## Interaction grammar

- Orange means the current setting or an uncertain word; it never carries meaning without weight and an underline.
- Mint speaker tabs introduce a new speaker and include the speaker name in text.
- User terms use a cream outline and double underline.
- Controls press inward by 1 px. Focus uses a 3 px orange ring with a dark offset.
- Keyboard: Space plays, Left/Right seek five seconds, J/K moves between cues, and Escape closes dialogs.
- Every salience mark retains the spoken token in normal reading order. Screen readers get a concise description outside the caption text rather than repeated punctuation.

## Motion

The signature motion is a damped meter-needle sweep when playback changes cue. It lasts 220 ms and uses only transform. Caption changes cross-fade for 160 ms. With `prefers-reduced-motion: reduce`, both update instantly and all scrolling is non-animated. Nothing loops.

## Asset plan and prompt sheet

The hero art is an original still-life illustration of a compact caption calibration console. It is atmospheric context, not a screenshot and contains no instructional text. Product UI remains real HTML.

- Subject: compact 1950s-inspired acoustic caption console with a glowing rectangular caption aperture, two brass knobs, one VU meter, and a folded caption sheet.
- World/materials: matte charcoal enamel, walnut, aged brass, cream paper, acoustic felt.
- Light/lens: warm pool of desk light, restrained cinematic shadows, three-quarter 50 mm view.
- Palette words: charcoal, tobacco walnut, parchment, amber-orange, muted mint.
- Negative list: people, ears, hearing aids, brands, logos, readable text, watermark, neon gradients, glossy sci-fi UI, extra knobs, distorted hardware.

Generation prompt: “Use case: stylized-concept. Asset type: landing-page hero illustration. A compact 1950s-inspired acoustic caption calibration console on a dark walnut desk, matte charcoal enamel face, one glowing rectangular caption aperture, two aged-brass knobs, one analog VU meter, folded cream caption sheet, restrained editorial gouache and screen-print texture, warm pool of desk light, three-quarter 50 mm view, charcoal and parchment with amber-orange and muted-mint accents, clean negative space, tactile and plausible hardware. No people, no ears, no hearing aids, no brands, no logos, no readable text, no watermark, no neon gradient, no glossy sci-fi interface, no malformed or extra controls.”

Provenance: generated for this repository on 2026-08-28 with the factory image deployment using `/opt/fleet/lib/gen-image.sh`. The final WebP is an original project asset under the repository’s MIT license. A source PNG and prompt sidecar are retained in `assets/src/`.
