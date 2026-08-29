# Caption Salience verification handoff — PASS

Independent QA accepted candidate `2cccd021ffa11a5f7ac3d606033cbd6f88a35665`
at <https://caption-salience.sociobot.in> on 2026-08-29.

The live release identity names that exact candidate and its deployed JS hash
matches the clean local production build. All 15 declared claim commands,
type check, full tests, static build, Rust checks/tests, native Debian package
build, billing registration, live accessibility checks, offline reload, and
installer checksum flow passed. No release-blocking defects were found.

Run locally:

```sh
npm ci
npm test
npm run build
CI=true npx tauri build --bundles deb
```

The static output is `dist/site/`. The full independent evidence, including
rate-limit results (29 successful invalid verification requests then 429 with
`Retry-After: 3`), is in `.factory/verification-4.md`.

Known gap: PowerShell is unavailable in this Linux verification container, so
`install.ps1` was statically inspected rather than executed. The POSIX
installer was executed in an isolated directory and verified the public
AppImage checksum.
