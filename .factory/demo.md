# Demo sandbox

- URL: `https://caption-salience.sociobot.in/?demo=1` or local `http://localhost:5173/?demo=1`. `/demo` is an equivalent direct route.
- Entry: select **Try it with sample data** from the first screen.
- Sample: five WebVTT-style cues between Maya and Rowan. Three tokens include source-supplied confidence below 70 percent. “fourteen” and “Cedar Street” are chosen terms.
- Reset: select **Reset demo** in the persistent mint banner.
- Exit: select **Leave demo and open captions**. Demo cues are discarded and the empty real player opens.
- Storage: demo state stays in memory. It does not read or write `caption-salience:*` or `sb_license:caption-salience*` localStorage keys.
- Offline check: visit once while online, wait for the service worker, switch the browser offline, and reload `/demo`.
