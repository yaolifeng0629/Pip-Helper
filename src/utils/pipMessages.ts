export type PipStatus = 'active' | 'ready' | 'no-video' | 'blocked' | 'unsupported' | 'unavailable';

export interface PipCandidatePreview {
  id: string;
  title: string;
  thumbnail?: string;
  duration: string;
  dimensions: string;
  isPlaying: boolean;
}

export interface PipState {
  status: PipStatus;
  candidateCount: number;
  candidates: PipCandidatePreview[];
  currentSite: string;
  siteAllowed: boolean;
  activeVideoTitle?: string;
}

export type PipRequest =
  | { type: 'pip:get-state' }
  | { type: 'pip:toggle' }
  | { type: 'pip:exit' }
  | { type: 'pip:choose-video' }
  | { type: 'pip:select-video'; candidateId: string }
  | { type: 'pip:toggle-site-rule' };

export interface PipResponse {
  ok: boolean;
  state: PipState;
  error?: 'no-video' | 'blocked' | 'unsupported' | 'not-allowed';
}

export interface PipStateChangedMessage {
  type: 'pip:state-changed';
  state: PipState;
}

export function isPipRequest(value: unknown): value is PipRequest {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;

  return [
    'pip:get-state',
    'pip:toggle',
    'pip:exit',
    'pip:choose-video',
    'pip:select-video',
    'pip:toggle-site-rule',
  ].includes(value.type as string);
}
