# Caption Salience adversarial review 1 handoff — FAIL

Reviewed the live site and clean commit
`2b5ea58b86ba5a3f9495f16c32147aeb97c452c9` on 2026-08-29. The complete report
is in `.factory/review-1.md`. Product code was not changed.

## What was done

- Captured cold 390 × 844 and 1440 × 900 first screens before scrolling.
- Audited every landing-page and README copy unit with word counts.
- Exercised the one-click demo, Reset, Start for real, storage isolation, request
  logging, and live offline reload.
- Ran all 15 claim commands separately from a clean clone.
- Re-ran the full test suite and production build.
- Checked route status/title/h1/metadata, deep navigation, focus/back behavior,
  404 handling, mobile overflow, link status, and live accessibility.
- Read the prior handoff; no earlier review or polish files exist.

## Verification

```sh
npm ci
npm test
npm run build
VERIFY_NODE_MODULES=/work/repo/node_modules \
  /opt/fleet/lib/verify-url.sh https://caption-salience.sociobot.in <temp-dir>
```

- All 15 individual claim commands: exit 0, 2 browser projects passed each.
- Full suite: 4 unit tests and 42 end-to-end tests passed; 2 expected
  desktop-project skips for mobile-only tests.
- Build: passed; JavaScript was 27.29 kB / 9.72 kB gzip.
- Live axe scan: zero violations on `/`, `/demo`, `/player`, `/install`,
  `/privacy`, and `/terms` at 390 px.
- Link crawl: all discovered links resolved; unknown routes returned the styled
  404.

## What remains

The review records 36 findings. Six are blocking: demo mode reads and writes a
real license verdict and sends the stored token externally; SRT import is not
covered by its claim test; caption-file privacy is not tested with a file;
audio timing is tested with invalid audio and no timing assertion; the paid
five-profile/₹499 claim is not proved; and the desktop landing page lacks the
required screenshot walkthrough. Unlisted claims, imprecise copy, missing route
announcement behavior, stale deep-route social metadata, and external-link
labels are also detailed in the report.
