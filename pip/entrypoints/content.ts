import Plyr from 'plyr';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 查找所有可用 video 元素
    function getPlayableVideos() {
      return Array.from(document.querySelectorAll('video')).filter(
        v => v.readyState > 0 && !v.disablePictureInPicture
      );
    }

    // Iframe 嵌入视频支持
    function getAllFramesVideos() {
      const videos = getPlayableVideos();
      // 查找所有同源 iframe 并递归查找视频
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

    // 多视频选择弹窗
    function showVideoPicker(videos: HTMLVideoElement[]) {
      // 简单实现：页面右下角弹出选择框
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

    // plyr 初始化和功能增强
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

    // 批量初始化页面所有 video
    function enhanceAllVideos() {
      getAllFramesVideos().forEach(enhanceWithPlyr);
    }
    enhanceAllVideos();
    // 监听 DOM 变化自动增强新 video
    const observer = new MutationObserver(() => enhanceAllVideos());
    observer.observe(document.body, { childList: true, subtree: true });

    // 快捷返回原始标签页
    window.addEventListener('keydown', (e) => {
      if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        window.focus();
      }
    });

    // 监听来自 background 的画中画请求
    browser.runtime.onMessage.addListener((msg) => {
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
      // 监听来自 popup 的探测请求
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

    // 播放进度、音量、速度同步
    let pipVideo: HTMLVideoElement | null = null;
    let lastState = { currentTime: 0, volume: 1, playbackRate: 1 };

    function syncToPiP(video: HTMLVideoElement) {
      lastState = {
        currentTime: video.currentTime,
        volume: video.volume,
        playbackRate: video.playbackRate,
      };
    }
    function syncFromPiP(video: HTMLVideoElement) {
      video.currentTime = lastState.currentTime;
      video.volume = lastState.volume;
      video.playbackRate = lastState.playbackRate;
    }

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
