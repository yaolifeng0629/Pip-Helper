export interface VideoCandidate {
  id: string;
  video: HTMLVideoElement;
  title: string;
  thumbnail?: string;
  duration: string;
  dimensions: string;
  isPlaying: boolean;
  score: number;
}

const videoIds = new WeakMap<HTMLVideoElement, string>();
const framePreviews = new WeakMap<HTMLVideoElement, string>();
let nextVideoId = 1;

function getVideoId(video: HTMLVideoElement): string {
  let id = videoIds.get(video);
  if (!id) {
    id = `video-${nextVideoId++}`;
    videoIds.set(video, id);
  }
  return id;
}

function hasPictureInPicture(video: HTMLVideoElement): boolean {
  return typeof video.requestPictureInPicture === 'function' && document.pictureInPictureEnabled !== false;
}

function isVisible(video: HTMLVideoElement): boolean {
  const rect = video.getBoundingClientRect();
  const styles = window.getComputedStyle(video);
  return rect.width >= 160
    && rect.height >= 90
    && styles.visibility !== 'hidden'
    && styles.display !== 'none'
    && Number(styles.opacity) > 0;
}

function getVideoTitle(video: HTMLVideoElement, index: number): string {
  const directLabel = video.getAttribute('aria-label') || video.title;
  if (directLabel) return directLabel.trim();

  const container = video.closest('article, li, [role="listitem"], [aria-label], [data-title], [title], [class*="video"], [class*="card"]');
  const containerLabel = container?.getAttribute('aria-label')
    || container?.getAttribute('data-title')
    || container?.getAttribute('title');
  if (containerLabel?.trim()) return containerLabel.trim();

  const heading = container?.querySelector('h1, h2, h3, h4, h5, [class*="title"], [data-title]');
  const headingText = heading?.textContent?.replace(/\s+/g, ' ').trim();
  if (headingText) return headingText.slice(0, 96);

  return `Video ${index + 1}`;
}

function formatDuration(duration: number): string {
  if (!Number.isFinite(duration) || duration <= 0) return '';

  const totalSeconds = Math.floor(duration);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`;
}

function getVideoThumbnail(video: HTMLVideoElement): string | undefined {
  if (video.poster) return video.poster;

  const cachedPreview = framePreviews.get(video);
  if (cachedPreview) return cachedPreview;
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return undefined;

  try {
    const width = 192;
    const aspectRatio = video.videoWidth && video.videoHeight
      ? video.videoWidth / video.videoHeight
      : 16 / 9;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.max(72, Math.round(width / aspectRatio));
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL('image/jpeg', 0.72);
    framePreviews.set(video, preview);
    return preview;
  } catch {
    // Cross-origin and DRM video frames cannot be read into a canvas.
    return undefined;
  }
}

function getScore(video: HTMLVideoElement): number {
  const rect = video.getBoundingClientRect();
  const area = Math.min(rect.width * rect.height, 4_000_000) / 10_000;
  const playing = !video.paused && !video.ended ? 1_000 : 0;
  const audible = !video.muted && video.volume > 0 ? 100 : 0;
  return playing + audible + area;
}

export function getPlayableVideos(root: ParentNode = document): HTMLVideoElement[] {
  return Array.from(root.querySelectorAll('video')).filter(video => {
    const hasSource = video.readyState > HTMLMediaElement.HAVE_NOTHING || Boolean(video.currentSrc || video.src);
    return hasSource && !video.disablePictureInPicture && hasPictureInPicture(video) && isVisible(video);
  });
}

export function getVideoCandidates(): VideoCandidate[] {
  return getPlayableVideos().map((video, index) => {
    const width = video.videoWidth || Math.round(video.getBoundingClientRect().width);
    const height = video.videoHeight || Math.round(video.getBoundingClientRect().height);
    return {
      id: getVideoId(video),
      video,
      title: getVideoTitle(video, index),
      thumbnail: getVideoThumbnail(video),
      duration: formatDuration(video.duration),
      dimensions: width && height ? `${width} x ${height}` : '',
      isPlaying: !video.paused && !video.ended,
      score: getScore(video),
    };
  }).sort((left, right) => right.score - left.score);
}

export function findAutomaticCandidate(candidates: VideoCandidate[]): VideoCandidate | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const [best, next] = candidates;
  // Only auto-select when one candidate is materially more likely to be the main video.
  return best.score - next.score >= 150 ? best : null;
}

export function isPictureInPictureSupported(): boolean {
  return document.pictureInPictureEnabled !== false
    && typeof HTMLVideoElement.prototype.requestPictureInPicture === 'function';
}
