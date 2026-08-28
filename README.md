# Caption Salience

Make uncertain caption words easier to notice.

Caption Salience is for people who hear some speech and miss other words. It opens local SRT and WebVTT files. The player marks source-supplied uncertainty, speaker changes, and chosen terms. It never invents a confidence score.

Try the isolated sample at `/demo`. Demo data stays in memory and is discarded when you leave.

## What works

- Open local SRT and WebVTT caption files.
- Add local audio and use the caption timer.
- Use Space to play and arrow keys to seek.
- Change caption size and emphasis without a license.
- Reload the app offline after the first visit.
- Use optional microphone captions when the device supports speech recognition.

Caption and audio files stay on the device. The app has no analytics or advertising. See [the claim contract](.factory/claims.json) for automated evidence.

## Confidence annotations

Caption Salience uses confidence only when the source supplies it. Add `<c.low>word</c>` or `<c.conf-42>word</c>` to WebVTT. Add `[?word?]` to SRT. The number in `conf-42` means 42 percent confidence.

## Run the site

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. The demo is at `http://localhost:5173/demo`.

## Test and build

Playwright 1.58.2 uses the Chromium browser supplied by the factory worker.

```sh
npm test
npm run build:site
```

The static site is written to `dist/site`, with `index.html` at its root. `npm run build` runs the same site build.

To check the Tauri shell locally, install Rust and the Tauri 2 system packages, then run:

```sh
npm run tauri dev
```

## Desktop releases

Tags matching `v*` run the release workflow. It builds unsigned macOS, Windows, and Linux packages. The workflow adds `SHA256SUMS` and `latest.json` to the GitHub release.

The installer page reads release metadata from the GitHub API. If the request fails, it links to the release page instead.

## License

Every caption and accessibility control is free. A ₹499 one-time supporter license adds up to five named setup profiles. Checkout and verification use only the Sociobot billing API.

The source code is available under the [MIT License](LICENSE).

## Privacy and product notes

- [Privacy](https://caption-salience.sociobot.in/privacy)
- [Terms](https://caption-salience.sociobot.in/terms)
- [Demo contract](.factory/demo.md)
- [Design system and artwork provenance](.factory/design.md)
