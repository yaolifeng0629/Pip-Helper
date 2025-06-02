/**
 * 视频增强工具函数
 */
import Plyr from 'plyr';

/**
 * 用 plyr 增强 video 元素，支持自定义控件、预览图等
 * @param video 要增强的视频元素
 * @returns Plyr 实例
 */
export function enhanceWithPlyr(video: HTMLVideoElement): Plyr | null {
  // 如果已经增强过，则返回现有实例
  if ((video as any)._plyr) return (video as any)._plyr;

  try {
    // 创建 Plyr 实例
    const plyr = new Plyr(video, {
      controls: [
        'play-large', 'play', 'progress', 'current-time',
        'mute', 'volume', 'settings', 'pip', 'fullscreen'
      ],
      tooltips: { controls: true, seek: true },
      previewThumbnails: { enabled: true },
      settings: ['quality', 'speed', 'loop'],
    });

    // 保存实例引用到视频元素
    (video as any)._plyr = plyr;

    return plyr;
  } catch (error) {
    console.error('增强视频失败:', error);
    return null;
  }
}

/**
 * 画中画状态同步相关变量
 */
let pipVideo: HTMLVideoElement | null = null;
let lastState = { currentTime: 0, volume: 1, playbackRate: 1 };

/**
 * 同步当前视频状态到画中画
 * @param video 视频元素
 */
export function syncToPiP(video: HTMLVideoElement): void {
  lastState = {
    currentTime: video.currentTime,
    volume: video.volume,
    playbackRate: video.playbackRate,
  };
}

/**
 * 从画中画同步状态到视频
 * @param video 视频元素
 */
export function syncFromPiP(video: HTMLVideoElement): void {
  video.currentTime = lastState.currentTime;
  video.volume = lastState.volume;
  video.playbackRate = lastState.playbackRate;
}

/**
 * 设置画中画视频引用
 * @param video 视频元素
 */
export function setPipVideo(video: HTMLVideoElement | null): void {
  pipVideo = video;
}

/**
 * 获取当前画中画视频
 * @returns 当前画中画视频元素或null
 */
export function getPipVideo(): HTMLVideoElement | null {
  return pipVideo;
}

/**
 * 初始化并增强所有可用视频
 * @param getVideos 获取视频的函数
 */
export function enhanceAllVideos(getVideos: () => HTMLVideoElement[]): void {
  getVideos().forEach(enhanceWithPlyr);
}

/**
 * 为视频元素绑定右键菜单事件
 * @param video 视频元素
 * @param callback 回调函数
 */
export function bindContextMenuToVideo(video: HTMLVideoElement, callback: (video: HTMLVideoElement) => void): void {
  if (!(video as any)._pipContextMenuBound) {
    video.addEventListener('contextmenu', () => {
      callback(video);
    });
    (video as any)._pipContextMenuBound = true;
  }

  // 兼容微信视频容器：为父容器也绑定 contextmenu
  const wxParent = video.closest('.video_iframe, .video_area, .js_video_area');
  if (wxParent && !(wxParent as any)._pipContextMenuBound) {
    wxParent.addEventListener('contextmenu', () => {
      callback(video);
    });
    (wxParent as any)._pipContextMenuBound = true;
  }
}
