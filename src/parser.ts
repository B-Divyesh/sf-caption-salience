import type { CaptionCue, CaptionToken } from './types';

const timestamp = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/;

export function parseTime(value: string): number {
  const match = value.trim().match(timestamp);
  if (!match) throw new Error(`Invalid timestamp: ${value}`);
  return Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

function tokenize(raw: string): CaptionToken[] {
  const normalized = raw
    .replace(/<c\.(?:low|uncertain|conf-(\d{1,3}))>(.*?)<\/c>/gi, (_, confidence, text) => {
      const score = confidence === undefined ? 45 : Math.min(100, Number(confidence));
      return `⟦${score}:${text}⟧`;
    })
    .replace(/\[\?([^\]]+)\?\]/g, '⟦45:$1⟧')
    .replace(/<[^>]+>/g, '');

  const parts = normalized.match(/⟦\d{1,3}:[^⟧]+⟧|\S+/g) || [];
  return parts.map((part) => {
    const uncertain = part.match(/^⟦(\d{1,3}):(.+)⟧$/);
    return uncertain
      ? { text: uncertain[2], confidence: Number(uncertain[1]) / 100 }
      : { text: part };
  });
}

function extractSpeaker(text: string): { speaker?: string; text: string } {
  const voice = text.match(/^<v(?:\.[^ >]+)?\s+([^>]+)>([\s\S]*)$/i);
  if (voice) return { speaker: voice[1].trim(), text: voice[2].replace(/<\/v>$/i, '').trim() };
  const label = text.match(/^([A-Z][A-Z0-9 _'-]{1,24}):\s+([\s\S]+)$/);
  return label ? { speaker: label[1].trim(), text: label[2].trim() } : { text };
}

export function parseCaptions(source: string): CaptionCue[] {
  const clean = source.replace(/^\uFEFF/, '').replace(/\r/g, '').trim();
  if (!clean) throw new Error('The caption file is empty. Choose an SRT or WebVTT file with timed captions.');
  const content = clean.replace(/^WEBVTT[^\n]*\n+/, '');
  const blocks = content.split(/\n{2,}/);
  const cues: CaptionCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex < 0) continue;
    const [left, rightWithSettings] = lines[timingIndex].split('-->');
    const right = rightWithSettings.trim().split(/\s+/)[0];
    try {
      const start = parseTime(left);
      const end = parseTime(right);
      if (end <= start) continue;
      const body = lines.slice(timingIndex + 1).join(' ').trim();
      if (!body) continue;
      const spoken = extractSpeaker(body);
      cues.push({ id: `cue-${cues.length + 1}`, start, end, speaker: spoken.speaker, tokens: tokenize(spoken.text) });
    } catch {
      // Ignore malformed blocks; a useful file may contain one damaged cue.
    }
  }

  if (!cues.length) throw new Error('No timed captions were found. Choose a valid SRT or WebVTT file.');
  return cues.sort((a, b) => a.start - b.start);
}

export function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, '0')}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
}
