import { getDomain, isUrlAllowed, toggleUrlRule } from './storage';
import { showCandidatePicker, showToast } from './ui';
import {
  findAutomaticCandidate,
  getVideoCandidates,
  isPictureInPictureSupported,
  type VideoCandidate,
} from './video';
import type { PipCandidatePreview, PipRequest, PipResponse, PipState } from './pipMessages';

type StateListener = (state: PipState) => void;

export class PipController {
  private candidates: VideoCandidate[] = [];
  private currentPipVideo: HTMLVideoElement | null = null;
  private observer: MutationObserver | null = null;
  private refreshTimer: number | null = null;
  private readonly boundVideos = new WeakSet<HTMLVideoElement>();

  constructor(private readonly onStateChange: StateListener) {}

  start(): void {
    this.currentPipVideo = document.pictureInPictureElement as HTMLVideoElement | null;
    this.refresh();

    const observe = () => {
      this.observer = new MutationObserver(() => this.scheduleRefresh());
      this.observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.body) observe();
    else document.addEventListener('DOMContentLoaded', observe, { once: true });
  }

  async handle(request: PipRequest): Promise<PipResponse> {
    this.refresh();

    if (request.type === 'pip:get-state') return this.response(true);
    if (request.type === 'pip:toggle-site-rule') {
      await toggleUrlRule(window.location.href);
      this.refresh();
      return this.response(true);
    }

    if (!isPictureInPictureSupported()) return this.response(false, 'unsupported');
    if (!(await isUrlAllowed(window.location.href))) return this.response(false, 'blocked');

    if (request.type === 'pip:exit' || (request.type === 'pip:toggle' && document.pictureInPictureElement)) {
      await document.exitPictureInPicture();
      return this.response(true);
    }

    if (this.candidates.length === 0) return this.response(false, 'no-video');

    if (request.type === 'pip:choose-video') {
      this.openPicker();
      return this.response(true);
    }

    if (request.type === 'pip:select-video') {
      const candidate = this.candidates.find(item => item.id === request.candidateId);
      return candidate ? this.enter(candidate) : this.response(false, 'no-video');
    }

    const automaticCandidate = findAutomaticCandidate(this.candidates);
    if (automaticCandidate) {
      return this.enter(automaticCandidate);
    }

    this.openPicker();
    return this.response(true);
  }

  private refresh(): void {
    this.candidates = getVideoCandidates();
    this.candidates.forEach(candidate => this.bindVideo(candidate.video));
    void this.emitState();
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.refresh();
    }, 120);
  }

  private bindVideo(video: HTMLVideoElement): void {
    if (this.boundVideos.has(video)) return;
    this.boundVideos.add(video);

    video.addEventListener('enterpictureinpicture', this.handleEnterPictureInPicture);
    video.addEventListener('leavepictureinpicture', this.handleLeavePictureInPicture);
    video.addEventListener('loadedmetadata', this.scheduleRefresh.bind(this), { passive: true });
    video.addEventListener('loadeddata', this.scheduleRefresh.bind(this), { passive: true });
    video.addEventListener('canplay', this.scheduleRefresh.bind(this), { passive: true });
    video.addEventListener('play', this.scheduleRefresh.bind(this), { passive: true });
    video.addEventListener('pause', this.scheduleRefresh.bind(this), { passive: true });
    video.addEventListener('emptied', this.scheduleRefresh.bind(this), { passive: true });
  }

  private handleEnterPictureInPicture = (event: Event): void => {
    this.currentPipVideo = event.currentTarget as HTMLVideoElement;
    this.refresh();
  };

  private handleLeavePictureInPicture = (): void => {
    this.currentPipVideo = null;
    this.refresh();
  };

  private openPicker(): void {
    void showCandidatePicker(this.candidates, candidate => {
      void this.enter(candidate);
    });
  }

  private async enter(candidate: VideoCandidate): Promise<PipResponse> {
    try {
      if (document.pictureInPictureElement && document.pictureInPictureElement !== candidate.video) {
        await document.exitPictureInPicture();
      }
      await candidate.video.requestPictureInPicture();
      return this.response(true);
    } catch (error) {
      console.warn('Unable to enter Picture-in-Picture:', error);
      showToast('This video does not allow Picture-in-Picture.', 'error');
      return this.response(false, 'not-allowed');
    }
  }

  private async response(ok: boolean, error?: PipResponse['error']): Promise<PipResponse> {
    return { ok, error, state: await this.getState() };
  }

  private async getState(): Promise<PipState> {
    const currentSite = getDomain(window.location.href);
    const siteAllowed = await isUrlAllowed(window.location.href);

    if (!isPictureInPictureSupported()) {
      return { status: 'unsupported', candidateCount: 0, candidates: [], currentSite, siteAllowed };
    }
    if (!siteAllowed) {
      return { status: 'blocked', candidateCount: this.candidates.length, candidates: this.previewCandidates(), currentSite, siteAllowed };
    }
    if (document.pictureInPictureElement) {
      const activeVideo = document.pictureInPictureElement as HTMLVideoElement;
      const activeCandidate = this.candidates.find(candidate => candidate.video === activeVideo);
      return {
        status: 'active',
        candidateCount: this.candidates.length,
        candidates: this.previewCandidates(),
        currentSite,
        siteAllowed,
        activeVideoTitle: activeCandidate?.title || this.currentPipVideo?.title || undefined,
      };
    }
    if (this.candidates.length === 0) {
      return { status: 'no-video', candidateCount: 0, candidates: [], currentSite, siteAllowed };
    }
    return { status: 'ready', candidateCount: this.candidates.length, candidates: this.previewCandidates(), currentSite, siteAllowed };
  }

  private previewCandidates(): PipCandidatePreview[] {
    return this.candidates.map(({ id, title, thumbnail, duration, dimensions, isPlaying }) => ({
      id,
      title,
      thumbnail,
      duration,
      dimensions,
      isPlaying,
    }));
  }

  private async emitState(): Promise<void> {
    this.onStateChange(await this.getState());
  }
}
