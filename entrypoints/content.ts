import Plyr from 'plyr';

/**
 * 获取当前页面所有可用的 video 元素
 */
function getPlayableVideos(): HTMLVideoElement[] {
  // 兼容微信公众号文章中的视频
  let videos = Array.from(document.querySelectorAll('video'));
  // 微信公众号文章有些视频 readyState 可能为 0，但依然可用，放宽条件
  videos = videos.filter(v => !v.disablePictureInPicture && (v.readyState > 0 || v.src || v.currentSrc));
  // 兼容微信文章中通过 .video_iframe、.video_area、.js_video_area 包裹的 video
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
 */
function getAllFramesVideos(): HTMLVideoElement[] {
  const videos = getPlayableVideos();
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
 * 弹出多视频选择器，供用户手动选择要画中画的视频
 */
function showVideoPicker(videos: HTMLVideoElement[]) {
  if (document.getElementById('pip-video-picker')) return;
  const picker = document.createElement('div');
  picker.id = 'pip-video-picker';
  picker.style.cssText = `position:fixed;z-index:999999;right:24px;bottom:24px;background:#fff;border-radius:8px;box-shadow:0 2px 16px #0002;padding:16px 20px;min-width:220px;max-width:320px;font-size:15px;line-height:2;`;
  picker.innerHTML = `<b>选择要画中画的视频：</b><br>`;
  videos.forEach((v, i) => {
    const label = v.currentSrc || v.src || `视频${i+1}`;
    const btn = document.createElement('button');
    btn.textContent = label.length > 60 ? label.slice(0, 60) + '...' : label;
    btn.style.cssText = 'display:block;width:100%;margin:6px 0;padding:6px 8px;border-radius:5px;border:none;background:#42b883;color:#fff;cursor:pointer;text-align:left;';
    btn.onclick = () => {
      v.requestPictureInPicture();
      picker.remove();
    };
    picker.appendChild(btn);
  });
  const cancel = document.createElement('button');
  cancel.textContent = '取消';
  cancel.style.cssText = 'display:block;width:100%;margin:6px 0;padding:6px 8px;border-radius:5px;border:none;background:#aaa;color:#fff;cursor:pointer;text-align:left;';
  cancel.onclick = () => picker.remove();
  picker.appendChild(cancel);
  document.body.appendChild(picker);
}

/**
 * 用 plyr 增强 video 元素，支持自定义控件、预览图等
 */
function enhanceWithPlyr(video: HTMLVideoElement) {
  if ((video as any)._plyr) return;
  const plyr = new Plyr(video, {
    controls: [
      'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'
    ],
    tooltips: { controls: true, seek: true },
    previewThumbnails: { enabled: true },
    settings: ['quality', 'speed', 'loop'],
  });
  (video as any)._plyr = plyr;
}

/**
 * 初始化并增强所有可用 video
 */
function enhanceAllVideos() {
  getAllFramesVideos().forEach(enhanceWithPlyr);
}

/**
 * 画中画状态同步相关
 */
let pipVideo: HTMLVideoElement | null = null;
let lastState = { currentTime: 0, volume: 1, playbackRate: 1 };
let lastContextMenuVideo: HTMLVideoElement | null = null;
/**
 * 同步当前视频状态到画中画
 */
function syncToPiP(video: HTMLVideoElement) {
  lastState = {
    currentTime: video.currentTime,
    volume: video.volume,
    playbackRate: video.playbackRate,
  };
}
/**
 * 从画中画同步状态到视频
 */
function syncFromPiP(video: HTMLVideoElement) {
  video.currentTime = lastState.currentTime;
  video.volume = lastState.volume;
  video.playbackRate = lastState.playbackRate;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 初始化所有视频播放器
    enhanceAllVideos();
    // 监听 DOM 变化自动增强新 video
    const observer = new MutationObserver(() => enhanceAllVideos());
    observer.observe(document.body, { childList: true, subtree: true });

    // 为所有 video 添加 contextmenu 监听
    function bindContextMenuToVideos() {
      getAllFramesVideos().forEach(video => {
        if (!(video as any)._pipContextMenuBound) {
          video.addEventListener('contextmenu', () => {
            lastContextMenuVideo = video;
          });
          (video as any)._pipContextMenuBound = true;
        }
        // 兼容微信视频容器：为父容器也绑定 contextmenu
        const wxParent = video.closest('.video_iframe, .video_area, .js_video_area');
        if (wxParent && !(wxParent as any)._pipContextMenuBound) {
          wxParent.addEventListener('contextmenu', () => {
            lastContextMenuVideo = video;
          });
          (wxParent as any)._pipContextMenuBound = true;
        }
      });
    }
    bindContextMenuToVideos();
    // 监听 DOM 变化时也绑定
    const observer2 = new MutationObserver(() => bindContextMenuToVideos());
    observer2.observe(document.body, { childList: true, subtree: true });

    // 支持快捷键返回原始标签页
    window.addEventListener('keydown', (e) => {
      if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        window.focus();
      }
    });

    // 监听消息，实现画中画激活、多视频选择、探测等
    browser.runtime.onMessage.addListener((msg) => {
      // 只对最近右键的视频触发画中画
      if (msg?.type === 'toggle-pip') {
        if (lastContextMenuVideo && !lastContextMenuVideo.disablePictureInPicture) {
          lastContextMenuVideo.requestPictureInPicture().catch(() => {
            browser.runtime.sendMessage({ type: 'pip-error', reason: 'not-allowed' });
          });
          return;
        }
        // fallback: 兼容原有逻辑
        const videos = getAllFramesVideos();
        if (videos.length === 0) {
          browser.runtime.sendMessage({ type: 'pip-error', reason: 'no-video' });
          return;
        }
        const playing = videos.find(v => !v.paused && !v.ended);
        const target = playing || videos[0];
        if (target) {
          target.requestPictureInPicture().catch(() => {
            browser.runtime.sendMessage({ type: 'pip-error', reason: 'not-allowed' });
          });
        }
        return;
      }
      // 激活画中画
      if (msg === 'activate-pip') {
        const videos = getAllFramesVideos();
        if (videos.length === 0) {
          browser.runtime.sendMessage({ type: 'pip-error', reason: 'no-video' });
          return;
        }
        // 优先选择正在播放的视频，否则选第一个
        const playing = videos.find(v => !v.paused && !v.ended);
        const target = playing || videos[0];
        if (target) {
          target.requestPictureInPicture().catch(() => {
            browser.runtime.sendMessage({ type: 'pip-error', reason: 'not-allowed' });
          });
        }
      }
      // 探测页面是否有可用视频
      else if (msg?.type === 'probe-video') {
        const videos = getPlayableVideos();
        browser.runtime.sendMessage({ type: 'probe-result', hasVideo: videos.length > 0 });
      } else if (msg?.type === 'show-video-picker') {
        const videos = getAllFramesVideos();
        if (videos.length === 0) {
          browser.runtime.sendMessage({ type: 'pip-error', reason: 'no-video' });
        } else if (videos.length === 1) {
          videos[0].requestPictureInPicture();
        } else {
          showVideoPicker(videos);
        }
      }
    });

    // 画中画窗口与原视频状态同步
    document.addEventListener('enterpictureinpicture', (e: any) => {
      const video = e.target as HTMLVideoElement;
      pipVideo = video;
      syncToPiP(video);
      video.addEventListener('timeupdate', () => syncToPiP(video), { passive: true });
      video.addEventListener('volumechange', () => syncToPiP(video), { passive: true });
      video.addEventListener('ratechange', () => syncToPiP(video), { passive: true });
    });
    document.addEventListener('leavepictureinpicture', (e: any) => {
      const video = e.target as HTMLVideoElement;
      if (pipVideo) {
        syncFromPiP(video);
        pipVideo = null;
      }
    });
  },
});
