import './styles.css';
import { formatTime, parseCaptions } from './parser';
import { sampleCues } from './sample';
import type { CaptionCue, Preferences, SaliencePreset } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const realStorageKey = 'caption-salience:preferences';
const licenseKey = 'sb_license:caption-salience';
const profilesKey = 'caption-salience:profiles';
const initialUrl = new URL(location.href);
const isDemoUrl = (url: URL): boolean => url.pathname === '/demo' || url.searchParams.get('demo') === '1';
const defaultPreferences: Preferences = {
  fontSize: 44,
  preset: 'balanced',
  terms: ['fourteen', 'Cedar Street'],
  showSpeakers: true,
  showUncertain: true
};

let cues: CaptionCue[] = [];
let demoMode = isDemoUrl(initialUrl);
let currentTime = 0;
let playing = false;
let timerStart = 0;
let timeAtPlay = 0;
let animation = 0;
let audioUrl = '';
let recognition: { stop: () => void } | null = null;
let preferences: Preferences = demoMode
  ? { ...defaultPreferences, terms: [...defaultPreferences.terms] }
  : loadPreferences();

function loadPreferences(): Preferences {
  try {
    return { ...defaultPreferences, ...JSON.parse(localStorage.getItem(realStorageKey) || '{}') };
  } catch {
    return { ...defaultPreferences };
  }
}

function savePreferences(): void {
  if (!demoMode) localStorage.setItem(realStorageKey, JSON.stringify(preferences));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

function header(): string {
  return `<a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-route aria-label="Caption Salience home"><span class="wordmark-dial" aria-hidden="true"></span>Caption Salience</a>
      <nav aria-label="Main navigation">
        <a href="/?demo=1" data-route>Demo</a>
        <a href="/player" data-route>Player</a>
        <a href="/install" data-route>Install</a>
        <a href="/privacy" data-route>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `<footer>
    <p>Caption emphasis for people who hear some words and miss others.</p>
    <nav aria-label="Footer navigation"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="external-note">(external)</span></a></nav>
    <p class="build">v0.1.3 · Original generated artwork and app screenshots</p>
  </footer>`;
}

function demoBanner(): string {
  return demoMode ? `<aside class="demo-banner" aria-label="Demo status">
    <span><strong>Demo</strong> — sample data, nothing is saved</span>
    <span class="demo-actions"><button class="text-button" id="reset-demo">Reset demo</button><button class="text-button" id="start-real">Leave demo and open captions</button></span>
  </aside>` : '';
}

function homePage(): string {
  return `${header()}<main id="main">
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">A local caption player</p>
        <h1 id="home-title" tabindex="-1">Make uncertain caption words stand out</h1>
        <p class="lede">For people who hear some speech and need uncertain words to catch their eye.</p>
        <div class="hero-action"><a class="primary" href="/?demo=1" data-route>Try it with sample data</a><span>See five timed captions with the three marks already applied.</span></div>
        <ul class="plain-facts" aria-label="Product facts"><li>Caption and audio files stay on this device.</li><li>Works offline after the first visit.</li><li>Size and caption marks stay free.</li></ul>
      </div>
      <figure class="hero-art instrument-frame">
        <picture><source srcset="/assets/caption-console-720.webp 720w, /assets/caption-console-1200.webp 1200w" type="image/webp"><img src="/assets/caption-console-1200.webp" width="1200" height="800" alt="An illustrated caption console with a glowing display and brass controls." fetchpriority="high" decoding="async"></picture>
        <figcaption>Adjust caption size, uncertainty marks, speakers, and chosen terms.</figcaption>
      </figure>
    </section>
    <section class="live-preview" aria-labelledby="preview-title">
      <div><p class="eyebrow">Live preview</p><h2 id="preview-title">Preview the three caption marks</h2><p>Uncertainty appears only when the caption source supplies it. Chosen terms and speaker changes use separate marks.</p></div>
      <div class="caption-well preset-balanced" aria-label="Caption preview"><span class="speaker-chip">Maya</span><p>The train leaves from <span class="uncertain">platform</span> <span class="chosen">fourteen</span>.</p><div class="legend"><span><i class="swatch uncertain-swatch"></i>Supplied uncertainty</span><span><i class="swatch term-swatch"></i>Chosen term</span></div></div>
    </section>
    <section class="app-tour" aria-labelledby="tour-title"><p class="eyebrow">Desktop walkthrough</p><h2 id="tour-title">See the caption player in use</h2><div class="tour-grid">
      <figure><img src="/assets/walkthrough-open.webp" width="1200" height="750" loading="lazy" decoding="async" alt="Caption Salience showing an opened WebVTT file with a populated caption timeline."><figcaption>1. Open an SRT or WebVTT file. Its timed cues fill the caption timeline.</figcaption></figure>
      <figure><img src="/assets/walkthrough-marks.webp" width="1200" height="750" loading="lazy" decoding="async" alt="Caption Salience showing separate uncertainty, speaker, and chosen-term marks."><figcaption>2. Choose caption size, uncertainty, speaker, and chosen-term marks.</figcaption></figure>
      <figure><img src="/assets/walkthrough-play.webp" width="1200" height="750" loading="lazy" decoding="async" alt="Caption Salience playing a later cue while a local audio file controls the timer."><figcaption>3. Add local audio, then play or seek through the timed captions.</figcaption></figure>
    </div></section>
    <section class="steps" aria-labelledby="steps-title"><p class="eyebrow">Three steps</p><h2 id="steps-title">How the player works</h2><ol>
      <li><span>01</span><div><h3>Open captions</h3><p>Choose an SRT or WebVTT file. You can add local audio for timing.</p></div></li>
      <li><span>02</span><div><h3>Choose caption marks</h3><p>Choose text size, an emphasis preset, speakers, and chosen terms.</p></div></li>
      <li><span>03</span><div><h3>Play the timed captions</h3><p>Use Play, the timeline, cue buttons, or keyboard shortcuts to change cues.</p></div></li>
    </ol></section>
    <section class="boundaries" aria-labelledby="boundaries-title"><div><p class="eyebrow">Clear limits</p><h2 id="boundaries-title">A player, not a hearing test</h2></div><ul><li>It does not diagnose hearing loss.</li><li>It does not extract video or protected captions.</li><li>It does not invent confidence scores.</li><li>Optional microphone captions depend on your device speech service.</li></ul></section>
    <section class="paid" aria-labelledby="paid-title"><div><p class="eyebrow">One-time supporter license</p><h2 id="paid-title">Save up to five setup profiles</h2><p>Pay ₹499 once to save up to five named setup profiles. Size, uncertainty, speaker, and chosen-term controls stay free.</p></div><div class="paid-actions"><a class="primary" href="https://api.sociobot.in/api/v1/products/caption-salience/checkout" rel="external">Buy a license — ₹499 <span class="external-note">(external)</span></a><button class="secondary" id="restore-license">Activate a license</button><p>Sociobot is the merchant of record. <a href="mailto:support@sociobot.in">Request refunds from Sociobot</a>.</p></div></section>
  </main>${footer()}`;
}

function playerPage(): string {
  const isEmpty = cues.length === 0;
  return `${demoBanner()}${header()}<main id="main" class="app-main">
    <section class="player-heading"><div><p class="eyebrow">Caption player</p><h1 id="player-title" tabindex="-1">Make each caption easier to follow</h1></div><div class="file-actions">
      <label class="primary file-label">Open SRT or WebVTT<input class="sr-only" id="caption-file" type="file" accept=".srt,.vtt,text/vtt,application/x-subrip"></label>
      <label class="secondary file-label">Add local audio<input class="sr-only" id="audio-file" type="file" accept="audio/*"></label>
      <button class="secondary" id="mic-button">${recognition ? 'Stop microphone' : 'Use microphone'}</button>
    </div></section>
    <p id="file-status" class="status-line" role="status">${demoMode ? 'Sample conversation loaded. Demo changes are not saved.' : 'No caption file is open. Files are read only on this device.'}</p>
    ${isEmpty ? emptyPlayer() : activePlayer()}
  </main>${footer()}`;
}

function emptyPlayer(): string {
  return `<section class="empty-panel instrument-panel" aria-labelledby="empty-title"><div class="empty-meter" aria-hidden="true"><span></span></div><h2 id="empty-title">Your captions will appear here</h2><p>Open an SRT or WebVTT file, or load the sample conversation.</p><button class="primary" id="load-sample">Try it with sample data</button><p class="format-note">To supply uncertainty, use <code>&lt;c.low&gt;word&lt;/c&gt;</code> in WebVTT or <code>[?word?]</code> in SRT.</p></section>`;
}

function cuePlain(cue: CaptionCue): string {
  return cue.tokens.map((token) => token.text).join(' ');
}

function tokenHtml(cue: CaptionCue): string {
  const terms = preferences.terms.map((term) => term.toLocaleLowerCase()).filter(Boolean);
  return cue.tokens.map((token) => {
    const clean = token.text.toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    const chosen = terms.some((term) => clean === term || token.text.toLocaleLowerCase().includes(term));
    const uncertain = preferences.showUncertain && token.confidence !== undefined && token.confidence < .7;
    const classes = [uncertain ? 'uncertain' : '', chosen ? 'chosen' : ''].filter(Boolean).join(' ');
    const label = uncertain ? ` aria-label="${escapeHtml(token.text)}, uncertain"` : '';
    return classes ? `<span class="${classes}"${label}>${escapeHtml(token.text)}</span>` : escapeHtml(token.text);
  }).join(' ');
}

function activeCueIndex(): number {
  const found = cues.findIndex((cue) => currentTime >= cue.start && currentTime < cue.end);
  if (found >= 0) return found;
  if (currentTime >= cues[cues.length - 1].end) return cues.length - 1;
  return 0;
}

function activePlayer(): string {
  const activeIndex = activeCueIndex();
  const cue = cues[activeIndex];
  const duration = cues[cues.length - 1].end;
  return `<div class="player-grid">
    <section class="playback instrument-panel" aria-labelledby="caption-display-title">
      <div class="panel-label"><h2 id="caption-display-title">Current caption</h2><span id="source-badge">${demoMode ? 'SAMPLE' : 'LOCAL FILE'}</span></div>
      <div class="meter"><span>LEVEL</span><div class="meter-track"><i id="meter-needle"></i></div><span>VOICE</span></div>
      <div id="caption-well" class="caption-well preset-${preferences.preset}" style="--caption-size:${preferences.fontSize}px" aria-live="polite" aria-atomic="true">
        ${preferences.showSpeakers && cue.speaker ? `<span class="speaker-chip">${escapeHtml(cue.speaker)}</span>` : ''}<p id="caption-text">${tokenHtml(cue)}</p>
      </div>
      <div class="transport">
        <button class="transport-button" id="back-button" aria-label="Go back five seconds">−5</button>
        <button class="primary play-button" id="play-button">${playing ? 'Pause' : 'Play'}</button>
        <button class="transport-button" id="forward-button" aria-label="Go forward five seconds">+5</button>
        <label for="timeline">Playback position</label><input id="timeline" type="range" min="0" max="${duration}" step="0.1" value="${currentTime}" aria-valuetext="${formatTime(currentTime)}">
        <output id="time-output" for="timeline">${formatTime(currentTime)} / ${formatTime(duration)}</output>
      </div>
      <audio id="local-audio" ${audioUrl ? `src="${escapeHtml(audioUrl)}"` : ''} preload="metadata"></audio>
      <p class="shortcuts">Space: play · ←/→: five seconds · J/K: previous/next caption</p>
    </section>
    <aside class="control-bank instrument-panel" aria-labelledby="controls-title"><div class="panel-label"><h2 id="controls-title">Caption controls</h2><span>SETTINGS</span></div>
      <fieldset><legend>Emphasis preset</legend>${(['balanced', 'strong', 'outline'] as SaliencePreset[]).map((preset) => `<label class="radio-control"><input type="radio" name="preset" value="${preset}" ${preferences.preset === preset ? 'checked' : ''}><span>${preset[0].toUpperCase() + preset.slice(1)}</span></label>`).join('')}</fieldset>
      <label for="font-size">Caption size <output id="size-output">${preferences.fontSize} px</output></label><input id="font-size" type="range" min="28" max="72" step="2" value="${preferences.fontSize}">
      <label class="switch"><input id="show-uncertain" type="checkbox" ${preferences.showUncertain ? 'checked' : ''}><span>Mark supplied uncertainty</span></label>
      <label class="switch"><input id="show-speakers" type="checkbox" ${preferences.showSpeakers ? 'checked' : ''}><span>Show speaker changes</span></label>
      <label for="terms">Chosen terms <span class="hint">separate with commas</span></label><input id="terms" type="text" value="${escapeHtml(preferences.terms.join(', '))}" autocomplete="off">
      <p class="legend"><span><i class="swatch uncertain-swatch"></i>Uncertain</span><span><i class="swatch term-swatch"></i>Chosen term</span></p>
      ${profileControls()}
    </aside>
    <section class="cue-list instrument-panel" aria-labelledby="cue-list-title"><div class="panel-label"><h2 id="cue-list-title">Caption timeline</h2><span>${cues.length} CUES</span></div><ol>${cues.map((item, index) => `<li><button data-cue="${index}" ${index === activeIndex ? 'aria-current="true"' : ''}><time>${formatTime(item.start)}</time><span>${item.speaker ? `<b>${escapeHtml(item.speaker)}</b> ` : ''}${escapeHtml(cuePlain(item))}</span></button></li>`).join('')}</ol></section>
  </div>`;
}

function isLicensed(): boolean {
  if (demoMode) return false;
  try { return JSON.parse(localStorage.getItem(`${licenseKey}:verdict`) || '{}').valid === true; } catch { return false; }
}

function profileControls(): string {
  if (demoMode) return '';
  if (!isLicensed()) return `<div class="profile-box"><p><strong>Saved profiles</strong></p><p>A supporter license adds up to five named setup profiles.</p><a href="https://api.sociobot.in/api/v1/products/caption-salience/checkout" rel="external">Buy a license <span class="external-note">(external)</span></a></div>`;
  const profiles = loadProfiles();
  return `<div class="profile-box"><p><strong>Saved profiles</strong> <span>${profiles.length}/5</span></p><div class="profile-actions"><button class="secondary" id="save-profile" ${profiles.length >= 5 ? 'disabled' : ''}>Save this setup</button>${profiles.map((profile, index) => `<button class="text-button profile-load" data-profile="${index}">Load ${escapeHtml(profile.name)}</button>`).join('')}</div></div>`;
}

function loadProfiles(): { name: string; preferences: Preferences }[] {
  if (demoMode) return [];
  try { return JSON.parse(localStorage.getItem(profilesKey) || '[]'); } catch { return []; }
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  const title = privacy ? 'Keep captions on your device' : 'Use Caption Salience fairly';
  return `${header()}<main id="main" class="prose-page"><p class="eyebrow">${privacy ? 'Privacy' : 'Terms'}</p><h1 tabindex="-1">${title}</h1>${privacy ? `
    <h2>What stays local</h2><p>Caption and audio files are opened in memory. Caption Salience does not upload them.</p><p>Your chosen terms and display settings stay in this browser. You can clear them from browser storage.</p>
    <h2>When a network is used</h2><p>The Install page asks GitHub for current release details. License checks send only your license token to Sociobot.</p><p>Microphone captions use the speech service supplied by your browser or operating system. Check that service before using private speech.</p>
    <h2>What we collect</h2><p>This version has no analytics, advertising, accounts, or tracking cookies.</p>` : `
    <h2>Your files</h2><p>You keep ownership of files you open. Use only files you have permission to use.</p>
    <h2>What the tool provides</h2><p>The tool presents captions and supplied confidence. It is not medical advice and does not promise transcription accuracy.</p>
    <h2>Licenses and refunds</h2><p>A ₹499 license is a one-time purchase for up to five saved setup profiles. Sociobot is the merchant of record.</p><p><a href="mailto:support@sociobot.in">Request refunds from Sociobot</a>. A completed refund ends the saved-profile license.</p>
    <h2>Warranty</h2><p>The software is provided under the MIT License without warranty. Size, uncertainty, speaker, and chosen-term controls remain free.</p>`}</main>${footer()}`;
}

function installPage(): string {
  return `${header()}<main id="main" class="install-page"><p class="eyebrow">Desktop app</p><h1 tabindex="-1">Install Caption Salience on your computer</h1><p class="lede">Choose the build for your system.</p><section class="download-panel instrument-panel" aria-labelledby="download-title"><h2 id="download-title">Download the desktop app</h2><p id="platform-copy">Checking the latest release…</p><div id="download-actions"><a class="primary" href="https://github.com/B-Divyesh/sf-caption-salience/releases" rel="external">View releases <span class="external-note">(external)</span></a></div><p>Current builds are unsigned. Your system may ask you to confirm the first launch.</p></section><section class="walkthrough" aria-labelledby="walk-title"><h2 id="walk-title">Open, adjust, and play captions</h2><ol><li><span>1</span><p>Open your caption file.</p></li><li><span>2</span><p>Choose emphasis and terms.</p></li><li><span>3</span><p>Play captions beside your audio.</p></li></ol></section></main>${footer()}`;
}

function notFoundPage(): string {
  return `${header()}<main id="main" class="not-found"><div class="lost-dial" aria-hidden="true"><span></span></div><p class="eyebrow">Error 404</p><h1 tabindex="-1">Page not found</h1><p>The address does not match a page in Caption Salience.</p><a class="primary" href="/" data-route>Return home</a></main>${footer()}`;
}

type RouteDefinition = { title: string; description: string; render: () => string };

const routes: Record<string, RouteDefinition> = {
  '/': { title: 'Caption Salience — Mark uncertain caption words', description: 'Play local SRT and WebVTT captions with separate marks for uncertainty, speakers, and chosen terms.', render: homePage },
  '/demo': { title: 'Demo — Caption Salience', description: 'Try Caption Salience with five timed sample captions in an isolated demo.', render: playerPage },
  '/player': { title: 'Player — Caption Salience', description: 'Open local SRT or WebVTT captions and adjust their visible marks.', render: playerPage },
  '/install': { title: 'Install — Caption Salience', description: 'Download Caption Salience for macOS, Windows, or Linux.', render: installPage },
  '/privacy': { title: 'Privacy — Caption Salience', description: 'Read what Caption Salience keeps on your device and when it uses the network.', render: () => legalPage('privacy') },
  '/terms': { title: 'Terms — Caption Salience', description: 'Read the terms for Caption Salience files, licenses, refunds, and warranty.', render: () => legalPage('terms') }
};

const notFoundRoute: RouteDefinition = {
  title: 'Page not found — Caption Salience',
  description: 'This Caption Salience page does not exist.',
  render: notFoundPage
};

function currentRoute(): { route: RouteDefinition; canonicalPath: string } {
  if (demoMode) return { route: routes['/demo'], canonicalPath: '/?demo=1' };
  const route = routes[location.pathname];
  return { route: route || notFoundRoute, canonicalPath: route ? location.pathname : '/404' };
}

function setMeta(name: string, value: string, property = false): void {
  document.querySelector<HTMLMetaElement>(`meta[${property ? 'property' : 'name'}="${name}"]`)?.setAttribute('content', value);
}

type RouteRenderOptions = {
  focusHeading?: boolean;
  scrollY?: number;
};

function saveScrollPosition(): void {
  history.replaceState({ ...(history.state || {}), scrollY: window.scrollY }, '', location.href);
}

function navigate(path: string): void {
  stopPlayback();
  const destination = new URL(path, location.origin);
  const previousDemo = demoMode;
  demoMode = isDemoUrl(destination);
  if (demoMode && (!previousDemo || cues.length === 0)) resetDemoState();
  if (previousDemo && !demoMode) {
    cues = [];
    currentTime = 0;
    clearAudio();
    preferences = loadPreferences();
  }
  saveScrollPosition();
  history.pushState({ scrollY: 0 }, '', `${destination.pathname}${destination.search}`);
  renderRoute({ focusHeading: true, scrollY: 0 });
}

function renderRoute(options: RouteRenderOptions = {}): void {
  const { route, canonicalPath } = currentRoute();
  document.title = route.title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://caption-salience.sociobot.in${canonicalPath}`);
  setMeta('description', route.description);
  setMeta('og:title', route.title, true);
  setMeta('og:description', route.description, true);
  setMeta('og:url', `https://caption-salience.sociobot.in${canonicalPath}`, true);
  setMeta('twitter:title', route.title);
  setMeta('twitter:description', route.description);
  app.innerHTML = route.render();
  bindGlobal();
  if (demoMode || location.pathname === '/player') bindPlayer();
  if (location.pathname === '/' && !demoMode) bindHome();
  if (location.pathname === '/install') loadRelease();
  const routeStatus = document.querySelector<HTMLElement>('#route-status');
  if (routeStatus) routeStatus.textContent = route.title;
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    if (options.focusHeading) heading?.focus({ preventScroll: true });
    if (typeof options.scrollY === 'number') window.scrollTo({ top: options.scrollY, left: 0, behavior: 'instant' });
  });
}

function bindGlobal(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = new URL(link.href);
    navigate(`${destination.pathname}${destination.search}`);
  }));
  document.querySelector('#reset-demo')?.addEventListener('click', () => { resetDemoState(); renderRoute(); });
  document.querySelector('#start-real')?.addEventListener('click', () => navigate('/player'));
}

function bindHome(): void {
  document.querySelector('#restore-license')?.addEventListener('click', () => {
    const token = window.prompt('Paste your Caption Salience license');
    if (token?.trim()) {
      localStorage.setItem(licenseKey, token.trim());
      void verifyLicense(token.trim(), true);
    }
  });
}

function resetDemoState(): void {
  clearAudio();
  cues = structuredClone(sampleCues);
  currentTime = 0;
  playing = false;
  preferences = { ...defaultPreferences, terms: [...defaultPreferences.terms] };
}

function bindPlayer(): void {
  document.querySelector<HTMLInputElement>('#caption-file')?.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const parsed = parseCaptions(await file.text());
      cues = parsed;
      currentTime = 0;
      renderRoute();
      setStatus(`${file.name} opened with ${parsed.length} timed captions.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The file could not be read. Choose another SRT or WebVTT file.', true);
    }
  });
  document.querySelector<HTMLInputElement>('#audio-file')?.addEventListener('change', (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = URL.createObjectURL(file);
    renderRoute();
    setStatus(`${file.name} added. Audio stays on this device.`);
  });
  document.querySelector('#load-sample')?.addEventListener('click', () => navigate('/demo'));
  document.querySelector('#play-button')?.addEventListener('click', togglePlayback);
  document.querySelector('#back-button')?.addEventListener('click', () => seek(currentTime - 5));
  document.querySelector('#forward-button')?.addEventListener('click', () => seek(currentTime + 5));
  document.querySelector<HTMLInputElement>('#timeline')?.addEventListener('input', (event) => seek(Number((event.currentTarget as HTMLInputElement).value)));
  document.querySelectorAll<HTMLButtonElement>('[data-cue]').forEach((button) => button.addEventListener('click', () => seek(cues[Number(button.dataset.cue)].start)));
  document.querySelectorAll<HTMLInputElement>('input[name="preset"]').forEach((radio) => radio.addEventListener('change', () => { preferences.preset = radio.value as SaliencePreset; savePreferences(); updateCaption(); }));
  document.querySelector<HTMLInputElement>('#font-size')?.addEventListener('input', (event) => { preferences.fontSize = Number((event.currentTarget as HTMLInputElement).value); savePreferences(); updateCaption(); });
  document.querySelector<HTMLInputElement>('#show-uncertain')?.addEventListener('change', (event) => { preferences.showUncertain = (event.currentTarget as HTMLInputElement).checked; savePreferences(); updateCaption(); });
  document.querySelector<HTMLInputElement>('#show-speakers')?.addEventListener('change', (event) => { preferences.showSpeakers = (event.currentTarget as HTMLInputElement).checked; savePreferences(); updateCaption(); });
  document.querySelector<HTMLInputElement>('#terms')?.addEventListener('change', (event) => { preferences.terms = (event.currentTarget as HTMLInputElement).value.split(',').map((term) => term.trim()).filter(Boolean); savePreferences(); updateCaption(); });
  document.querySelector('#mic-button')?.addEventListener('click', startMicrophone);
  document.querySelector('#save-profile')?.addEventListener('click', () => {
    const name = window.prompt('Name this setup');
    if (!name?.trim()) return;
    const profiles = loadProfiles();
    if (profiles.length >= 5) { setStatus('Five profiles are already saved. Load or remove one before saving another.', true); return; }
    profiles.push({ name: name.trim().slice(0, 30), preferences: structuredClone(preferences) });
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    renderRoute();
    setStatus(`${name.trim().slice(0, 30)} saved.`);
  });
  document.querySelectorAll<HTMLButtonElement>('.profile-load').forEach((button) => button.addEventListener('click', () => {
    const profile = loadProfiles()[Number(button.dataset.profile)];
    if (!profile) return;
    preferences = structuredClone(profile.preferences);
    savePreferences();
    renderRoute();
    setStatus(`${profile.name} loaded.`);
  }));
}

function setStatus(message: string, error = false): void {
  const element = document.querySelector<HTMLElement>('#file-status');
  if (element) { element.textContent = message; element.classList.toggle('error', error); }
}

function updateCaption(): void {
  if (!cues.length) return;
  const cue = cues[activeCueIndex()];
  const well = document.querySelector<HTMLElement>('#caption-well');
  const text = document.querySelector<HTMLElement>('#caption-text');
  if (well) {
    well.className = `caption-well preset-${preferences.preset}`;
    well.style.setProperty('--caption-size', `${preferences.fontSize}px`);
    const oldSpeaker = well.querySelector('.speaker-chip');
    oldSpeaker?.remove();
    if (preferences.showSpeakers && cue.speaker) well.insertAdjacentHTML('afterbegin', `<span class="speaker-chip">${escapeHtml(cue.speaker)}</span>`);
  }
  if (text) text.innerHTML = tokenHtml(cue);
  const size = document.querySelector<HTMLOutputElement>('#size-output');
  if (size) size.textContent = `${preferences.fontSize} px`;
  document.querySelectorAll('[data-cue]').forEach((button, index) => index === activeCueIndex() ? button.setAttribute('aria-current', 'true') : button.removeAttribute('aria-current'));
}

function togglePlayback(): void {
  const audio = document.querySelector<HTMLAudioElement>('#local-audio');
  playing = !playing;
  if (playing) {
    timerStart = performance.now();
    timeAtPlay = currentTime;
    if (audio?.src) { audio.currentTime = currentTime; void audio.play().catch(() => setStatus('Audio could not start. Press Play again or choose another audio file.', true)); }
    tick();
  } else {
    audio?.pause();
    cancelAnimationFrame(animation);
  }
  const button = document.querySelector('#play-button');
  if (button) button.textContent = playing ? 'Pause' : 'Play';
}

function stopPlayback(): void {
  playing = false;
  cancelAnimationFrame(animation);
  document.querySelector<HTMLAudioElement>('#local-audio')?.pause();
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

function clearAudio(): void {
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = '';
}

function tick(): void {
  if (!playing || !cues.length) return;
  const audio = document.querySelector<HTMLAudioElement>('#local-audio');
  currentTime = audio?.src && !audio.paused ? audio.currentTime : timeAtPlay + (performance.now() - timerStart) / 1000;
  const duration = cues[cues.length - 1].end;
  if (currentTime >= duration) { currentTime = duration; togglePlayback(); updateTransport(); updateCaption(); return; }
  updateTransport();
  updateCaption();
  animation = requestAnimationFrame(tick);
}

function seek(value: number): void {
  const duration = cues.length ? cues[cues.length - 1].end : 0;
  currentTime = Math.max(0, Math.min(value, duration));
  const audio = document.querySelector<HTMLAudioElement>('#local-audio');
  if (audio?.src) audio.currentTime = currentTime;
  timerStart = performance.now();
  timeAtPlay = currentTime;
  updateTransport();
  updateCaption();
}

function updateTransport(): void {
  const duration = cues[cues.length - 1]?.end || 0;
  const range = document.querySelector<HTMLInputElement>('#timeline');
  const output = document.querySelector<HTMLOutputElement>('#time-output');
  if (range) { range.value = String(currentTime); range.setAttribute('aria-valuetext', formatTime(currentTime)); }
  if (output) output.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  const needle = document.querySelector<HTMLElement>('#meter-needle');
  if (needle) needle.style.transform = `rotate(${(-38 + (activeCueIndex() % 5) * 19)}deg)`;
}

function startMicrophone(): void {
  type RecognitionConstructor = new () => { continuous: boolean; interimResults: boolean; onresult: (event: any) => void; onerror: (event: any) => void; onend: () => void; start: () => void; stop: () => void };
  const Constructor = (window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;
  if (!Constructor) { setStatus('Microphone captions are not available here. Open an SRT or WebVTT file instead.', true); return; }
  if (recognition) { recognition.stop(); recognition = null; setStatus('Microphone captions stopped.'); return; }
  const instance = new Constructor();
  instance.continuous = true;
  instance.interimResults = true;
  instance.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    const alternative = result[0];
    const words = String(alternative.transcript).trim().split(/\s+/);
    const supplied = typeof alternative.confidence === 'number' && alternative.confidence > 0 ? alternative.confidence : undefined;
    cues = [{ id: `mic-${Date.now()}`, start: 0, end: 3600, speaker: 'Microphone', tokens: words.map((text) => ({ text, confidence: supplied })) }];
    currentTime = 0;
    renderRoute();
    setStatus('Microphone captions are active. Your device speech service supplies the words.');
  };
  instance.onerror = () => setStatus('Microphone captions stopped. Check microphone permission, then try again.', true);
  instance.onend = () => { recognition = null; };
  recognition = instance;
  instance.start();
  setStatus('Listening for speech. Your browser or operating system may process the audio.');
}

async function loadRelease(): Promise<void> {
  const copy = document.querySelector('#platform-copy');
  const actions = document.querySelector('#download-actions');
  try {
    const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-caption-salience/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error('release unavailable');
    const release = await response.json() as { tag_name: string; html_url: string; assets: { name: string; browser_download_url: string }[] };
    const platform = /Win/i.test(navigator.userAgent) ? 'windows' : /Mac/i.test(navigator.userAgent) ? 'macOS' : 'Linux';
    const match = release.assets.find((asset) => platform === 'windows' ? /\.(msi|exe)$/i.test(asset.name) : platform === 'macOS' ? /\.(dmg|app\.tar\.gz)$/i.test(asset.name) : /\.(AppImage|deb)$/i.test(asset.name));
    if (copy) copy.textContent = `${release.tag_name} is ready for ${platform}.`;
    if (actions) actions.innerHTML = match ? `<a class="primary" href="${escapeHtml(match.browser_download_url)}" rel="external">Download for ${platform} <span class="external-note">(external)</span></a><a href="${escapeHtml(release.html_url)}" rel="external">All release files <span class="external-note">(external)</span></a>` : `<a class="primary" href="${escapeHtml(release.html_url)}" rel="external">View files for ${platform} <span class="external-note">(external)</span></a>`;
  } catch {
    if (copy) copy.textContent = 'Downloads are being published. Check the release page for current files.';
  }
}

async function verifyLicense(token: string, announce = false): Promise<void> {
  if (demoMode) return;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/caption-salience/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(`${licenseKey}:verdict`, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    if (announce) window.alert(result.valid ? 'License saved. Profile saving is available.' : 'That license is not active. Check the token and try again.');
    if (['/player', '/'].includes(location.pathname)) renderRoute();
  } catch {
    if (announce) window.alert('The license could not be checked. Your free caption controls still work.');
  }
}

function acceptReturnedLicense(): string | null {
  if (demoMode) return null;
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return null;
  localStorage.setItem(licenseKey, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search);
  void verifyLicense(token);
  return token;
}

window.addEventListener('popstate', (event) => {
  const wasDemo = demoMode;
  demoMode = isDemoUrl(new URL(location.href));
  if (demoMode && !wasDemo) resetDemoState();
  if (wasDemo && !demoMode) {
    cues = [];
    currentTime = 0;
    clearAudio();
    preferences = loadPreferences();
  }
  renderRoute({ focusHeading: true, scrollY: typeof event.state?.scrollY === 'number' ? event.state.scrollY : 0 });
});
window.addEventListener('keydown', (event) => {
  if (!(demoMode || location.pathname === '/player') || (event.target as HTMLElement)?.matches('input, textarea')) return;
  if (event.code === 'Space') { event.preventDefault(); if (cues.length) togglePlayback(); }
  if (event.key === 'ArrowLeft') seek(currentTime - 5);
  if (event.key === 'ArrowRight') seek(currentTime + 5);
  if (event.key.toLowerCase() === 'j' && cues.length) seek(cues[Math.max(0, activeCueIndex() - 1)].start);
  if (event.key.toLowerCase() === 'k' && cues.length) seek(cues[Math.min(cues.length - 1, activeCueIndex() + 1)].start);
});

if (demoMode) {
  resetDemoState();
} else {
  const returnedLicense = acceptReturnedLicense();
  const storedLicense = returnedLicense ? null : localStorage.getItem(licenseKey);
  if (storedLicense) {
    try {
      const verdict = JSON.parse(localStorage.getItem(`${licenseKey}:verdict`) || '{}') as { checkedAt?: number };
      if (!verdict.checkedAt || Date.now() - verdict.checkedAt > 86_400_000) void verifyLicense(storedLicense);
    } catch { void verifyLicense(storedLicense); }
  }
}
renderRoute({ focusHeading: true, scrollY: window.scrollY });

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
