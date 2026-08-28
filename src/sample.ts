import type { CaptionCue } from './types';

export const sampleSource = `WEBVTT

00:00:00.000 --> 00:00:04.200
<v Maya>The northbound train leaves from <c.conf-38>platform</c> fourteen.

00:00:04.200 --> 00:00:08.400
<v Rowan>Did you say fourteen, or <c.conf-44>forty</c>?

00:00:08.400 --> 00:00:13.000
<v Maya>Fourteen. Meet me beside the Cedar Street entrance.

00:00:13.000 --> 00:00:17.500
<v Rowan>I will bring the blue folder and the access card.

00:00:17.500 --> 00:00:22.000
<v Maya>The last service leaves at <c.conf-51>ten fifteen</c> tonight.`;

export const sampleCues: CaptionCue[] = [
  { id: 'sample-1', start: 0, end: 4.2, speaker: 'Maya', tokens: [{ text: 'The' }, { text: 'northbound' }, { text: 'train' }, { text: 'leaves' }, { text: 'from' }, { text: 'platform', confidence: .38 }, { text: 'fourteen.' }] },
  { id: 'sample-2', start: 4.2, end: 8.4, speaker: 'Rowan', tokens: [{ text: 'Did' }, { text: 'you' }, { text: 'say' }, { text: 'fourteen,' }, { text: 'or' }, { text: 'forty?', confidence: .44 }] },
  { id: 'sample-3', start: 8.4, end: 13, speaker: 'Maya', tokens: [{ text: 'Fourteen.' }, { text: 'Meet' }, { text: 'me' }, { text: 'beside' }, { text: 'the' }, { text: 'Cedar' }, { text: 'Street' }, { text: 'entrance.' }] },
  { id: 'sample-4', start: 13, end: 17.5, speaker: 'Rowan', tokens: [{ text: 'I' }, { text: 'will' }, { text: 'bring' }, { text: 'the' }, { text: 'blue' }, { text: 'folder' }, { text: 'and' }, { text: 'the' }, { text: 'access' }, { text: 'card.' }] },
  { id: 'sample-5', start: 17.5, end: 22, speaker: 'Maya', tokens: [{ text: 'The' }, { text: 'last' }, { text: 'service' }, { text: 'leaves' }, { text: 'at' }, { text: 'ten fifteen', confidence: .51 }, { text: 'tonight.' }] }
];
