export type SaliencePreset = 'balanced' | 'strong' | 'outline';

export interface CaptionToken {
  text: string;
  confidence?: number;
}

export interface CaptionCue {
  id: string;
  start: number;
  end: number;
  speaker?: string;
  tokens: CaptionToken[];
}

export interface Preferences {
  fontSize: number;
  preset: SaliencePreset;
  terms: string[];
  showSpeakers: boolean;
  showUncertain: boolean;
}
