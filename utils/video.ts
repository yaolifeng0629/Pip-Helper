/**
 * 视频操作相关工具函数
 */

/**
 * 获取当前页面所有可用的 video 元素
 * @returns 可用的视频元素数组
 */
export function getPlayableVideos(): HTMLVideoElement[] {
  // 兼容微信公众号文章中的视频
  let videos = Array.from(document.querySelectorAll('video'));
  // 微信公众号文章有些视频 readyState 可能为 0，但依然可用，放宽条件
  videos = videos.filter(v => !v.disablePictureInPicture && (v.readyState > 0 || v.src || v.currentSrc));

  // 兼容微信文章中通过特殊容器包裹的 video
  const wxContainers = document.querySelectorAll('.video_iframe, .video_area, .js_video_area');
  wxContainers.forEach(container => {
    const v = container.querySelector('video');
    if (v && !videos.includes(v) && !v.disablePictureInPicture) {
      videos.push(v);
    }
  });

  return videos;
}

/**
 * 获取当前页面及所有同源 iframe 内的可用 video 元素
 * @returns 所有可用的视频元素数组（包括iframe中的）
 */
export function getAllFramesVideos(): HTMLVideoElement[] {
  const videos = getPlayableVideos();

  // 尝试获取同源iframe中的视频
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      const win = iframe.contentWindow;
      if (win && win.document) {
        const innerVideos = Array.from(win.document.querySelectorAll('video')).filter(
          v => v.readyState > 0 && !v.disablePictureInPicture
        );
        videos.push(...innerVideos);
      }
    } catch (e) {
      // 跨域 iframe 无法访问，忽略
    }
  });

  return videos;
}

/**
 * 查找最佳的视频元素用于画中画
 * 优先选择正在播放的视频，否则选第一个
 * @returns 最佳的视频元素或null
 */
export function findBestVideoForPip(): HTMLVideoElement | null {
  const videos = getAllFramesVideos();
  if (videos.length === 0) return null;

  // 优先选择正在播放的视频
  const playing = videos.find(v => !v.paused && !v.ended);
  return playing || videos[0];
}

/**
 * 激活画中画模式
 * @param video 要激活画中画的视频元素
 * @returns Promise
 */
export function activatePictureInPicture(video: HTMLVideoElement): Promise<PictureInPictureWindow> {
  return video.requestPictureInPicture();
}

/**
 * 退出画中画模式
 * @returns Promise
 */
export function exitPictureInPicture(): Promise<void> {
  if (document.pictureInPictureElement) {
    return document.exitPictureInPicture();
  }
  return Promise.resolve();
}

/**
 * 检查浏览器是否支持画中画功能
 * @returns 是否支持
 */
export function isPictureInPictureSupported(): boolean {
  return !!document.pictureInPictureEnabled;
}
