import { describe, expect, it } from 'vitest';
import { formatTime, parseCaptions, parseTime } from '../src/parser';

describe('caption parser', () => {
  it('parses SRT timing, speakers, and supplied uncertainty', () => {
    const cues = parseCaptions(`1\n00:00:01,000 --> 00:00:03,500\nMAYA: Take the [?northbound?] train.`);
    expect(cues).toHaveLength(1);
    expect(cues[0].speaker).toBe('MAYA');
    expect(cues[0].tokens.find((token) => token.text === 'northbound')?.confidence).toBe(.45);
  });

  it('parses WebVTT confidence annotations', () => {
    const cues = parseCaptions(`WEBVTT\n\n00:01.000 --> 00:04.000\n<v Rowan>Use <c.conf-32>gate</c> four.</v>`);
    expect(cues[0].speaker).toBe('Rowan');
    expect(cues[0].tokens[1]).toEqual({ text: 'gate', confidence: .32 });
  });

  it('rejects files without timed captions', () => {
    expect(() => parseCaptions('A plain transcript')).toThrow(/No timed captions/);
  });

  it('formats and parses times', () => {
    expect(parseTime('01:02:03.500')).toBe(3723.5);
    expect(formatTime(65)).toBe('01:05');
  });
});
