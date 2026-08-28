# Demo sandbox

- URL: `https://caption-salience.sociobot.in/demo` or local `http://localhost:5173/demo`.
- Entry: select **Try it with sample data** from the first screen.
- Sample: five WebVTT-style cues between Maya and Rowan. Three tokens include source-supplied confidence below 70 percent. “fourteen” and “Cedar Street” are chosen terms.
- Reset: select **Reset demo** in the persistent mint banner.
- Exit: select **Start for real**. Demo cues are discarded.
- Storage: demo state stays in memory. It does not read or write the `caption-salience:*` localStorage namespace.
- Offline check: visit once while online, wait for the service worker, switch the browser offline, and reload `/demo`.
