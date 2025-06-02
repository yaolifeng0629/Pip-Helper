/**
 * 视频增强工具
 *
 * 提供视频播放器增强功能，包括画中画控制和同步
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

// 当前处于画中画模式的视频
let currentPipVideo: HTMLVideoElement | null = null;

// 设置当前画中画视频
export function setPipVideo(video: HTMLVideoElement | null): void {
  currentPipVideo = video;
}

// 获取当前画中画视频
export function getPipVideo(): HTMLVideoElement | null {
  return currentPipVideo;
}

/**
 * 为视频元素绑定右键菜单事件
 * @param video 视频元素
 * @param callback 回调函数
 */
export function bindContextMenuToVideo(video: HTMLVideoElement, callback: (video: HTMLVideoElement) => void): void {
  video.addEventListener('contextmenu', () => {
    callback(video);
  });
}

/**
 * 增强所有视频元素
 * @param getVideos 获取视频元素的函数
 */
export function enhanceAllVideos(getVideos: () => HTMLVideoElement[]): void {
  const videos = getVideos();
  videos.forEach(video => {
    // 确保视频支持画中画
    if ('pictureInPictureEnabled' in document && !video.disablePictureInPicture) {
      // 已经处理过的视频不再处理
      if (video.dataset.pipEnhanced) return;

      // 标记为已处理
      video.dataset.pipEnhanced = 'true';
    }
  });
}

/**
 * 从画中画视频同步状态到原视频
 * @param video 原视频元素
 */
export function syncFromPiP(video: HTMLVideoElement): void {
  // 同步播放状态
  if (!video.paused) {
    video.play().catch(() => {});
  }
}

/**
 * 从原视频同步状态到画中画视频
 * @param video 原视频元素
 */
export function syncToPiP(video: HTMLVideoElement): void {
  // 不需要特别处理，浏览器会自动同步
}

/**
 * 为画中画窗口添加自定义控件
 */
export function addPipControls(): void {
  if (!document.pictureInPictureElement) return;

  const pipVideo = document.pictureInPictureElement as HTMLVideoElement;

  // 创建画中画控件容器
  const pipWindow = pipVideo.parentElement;
  if (!pipWindow) return;

  // 使用画中画窗口的document
  const pipDoc = pipWindow.ownerDocument;
  if (!pipDoc) return;

  // 创建控件容器
  const controlsContainer = pipDoc.createElement('div');
  controlsContainer.className = 'pip-custom-controls';
  controlsContainer.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  // 添加播放/暂停按钮
  const playPauseBtn = pipDoc.createElement('button');
  playPauseBtn.innerHTML = pipVideo.paused ? '▶' : '⏸';
  playPauseBtn.style.cssText = `
    background: transparent;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin: 0 8px;
  `;
  playPauseBtn.onclick = () => {
    if (pipVideo.paused) {
      pipVideo.play();
      playPauseBtn.innerHTML = '⏸';
    } else {
      pipVideo.pause();
      playPauseBtn.innerHTML = '▶';
    }
  };

  // 添加音量控制
  const volumeBtn = pipDoc.createElement('button');
  volumeBtn.innerHTML = pipVideo.muted ? '🔇' : '🔊';
  volumeBtn.style.cssText = `
    background: transparent;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin: 0 8px;
  `;
  volumeBtn.onclick = () => {
    pipVideo.muted = !pipVideo.muted;
    volumeBtn.innerHTML = pipVideo.muted ? '🔇' : '🔊';
  };

  // 添加退出按钮
  const exitBtn = pipDoc.createElement('button');
  exitBtn.innerHTML = '×';
  exitBtn.style.cssText = `
    background: transparent;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin: 0 8px;
  `;
  exitBtn.onclick = () => {
    document.exitPictureInPicture();
  };

  // 添加按钮到控件容器
  controlsContainer.appendChild(playPauseBtn);
  controlsContainer.appendChild(volumeBtn);
  controlsContainer.appendChild(exitBtn);

  // 添加控件容器到画中画窗口
  pipWindow.appendChild(controlsContainer);

  // 显示/隐藏控件
  pipWindow.addEventListener('mouseover', () => {
    controlsContainer.style.opacity = '1';
  });

  pipWindow.addEventListener('mouseout', () => {
    controlsContainer.style.opacity = '0';
  });
}

/**
 * 添加多视频切换功能
 * @param videos 可用的视频元素数组
 */
export function setupVideoSwitching(videos: HTMLVideoElement[]): void {
  if (videos.length <= 1) return;

  let currentIndex = 0;

  // 找到当前画中画视频的索引
  if (document.pictureInPictureElement) {
    const pipVideo = document.pictureInPictureElement as HTMLVideoElement;
    const index = videos.indexOf(pipVideo);
    if (index !== -1) {
      currentIndex = index;
    }
  }

  // 添加键盘事件监听
  document.addEventListener('keydown', async (e) => {
    // 只有在画中画模式下才处理
    if (!document.pictureInPictureElement) return;

    // 左右方向键切换视频
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + videos.length) % videos.length;
      await switchToPipVideo(videos[currentIndex]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % videos.length;
      await switchToPipVideo(videos[currentIndex]);
    }
  });
}

/**
 * 切换到指定视频的画中画模式
 * @param video 要切换的视频元素
 */
async function switchToPipVideo(video: HTMLVideoElement): Promise<void> {
  if (!document.pictureInPictureElement) return;

  try {
    // 退出当前画中画
    await document.exitPictureInPicture();

    // 进入新的画中画
    await video.requestPictureInPicture();

    // 如果视频没在播放，则开始播放
    if (video.paused) {
      await video.play();
    }
  } catch (error) {
    console.error('切换视频失败:', error);
  }
}
