/**
 * 内容脚本 - 负责与页面交互并操作视频元素
 *
 * 功能：
 * 1. 检测和增强页面中的视频
 * 2. 处理画中画激活/退出
 * 3. 同步视频状态
 * 4. 处理用户交互（右键菜单、快捷键等）
 * 5. 提供多视频选择功能
 */
import { getAllFramesVideos, getPlayableVideos, findBestVideoForPip } from '../utils/video';
import { showVideoPicker, showToast } from '../utils/ui';
import { enhanceWithPlyr, syncToPiP, syncFromPiP, setPipVideo, enhanceAllVideos, bindContextMenuToVideo, addPipControls, setupVideoSwitching } from '../utils/videoEnhancer';
import { isUrlAllowed, getDomain } from '../utils/storage';

// 记录最近右键点击的视频元素
let lastContextMenuVideo: HTMLVideoElement | null = null;
// 记录页面中所有可用视频
let availableVideos: HTMLVideoElement[] = [];

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 初始化所有视频播放器
    enhanceAllVideos(getAllFramesVideos);

    // 更新可用视频列表
    function updateAvailableVideos() {
      availableVideos = getPlayableVideos();
      // 设置多视频切换功能
      setupVideoSwitching(availableVideos);
    }

    // 初始化时更新可用视频
    updateAvailableVideos();

    // 监听 DOM 变化自动增强新 video
    const observer = new MutationObserver(() => {
      enhanceAllVideos(getAllFramesVideos);
      updateAvailableVideos();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 为所有 video 添加 contextmenu 监听
    function bindContextMenuToVideos() {
      getAllFramesVideos().forEach(video => {
        bindContextMenuToVideo(video, (v) => {
          lastContextMenuVideo = v;
        });
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

    // 创建视频预览缩略图
    function createVideoThumbnail(video: HTMLVideoElement): string {
      try {
        // 创建临时 canvas
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // 确保视频有帧可以绘制
        if (video.readyState === 0) {
          // 如果视频尚未加载，尝试加载一帧
          video.currentTime = 1; // 尝试跳到第1秒，避免黑屏
        }

        // 绘制视频当前帧
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 转为 data URL
        return canvas.toDataURL('image/jpeg', 0.7);
      } catch (e) {
        console.error('Failed to create video thumbnail:', e);
        return '';
      }
    }

    // 增强版视频选择器
    function showEnhancedVideoPicker(videos: HTMLVideoElement[]) {
      // 创建视频信息数组
      const videoInfos = videos.map((video, index) => {
        // 获取视频标题
        let title = '';

        // 尝试从不同属性获取标题
        if (video.title) {
          title = video.title;
        } else if (video.getAttribute('aria-label')) {
          title = video.getAttribute('aria-label') || '';
        } else {
          // 尝试从父元素获取标题
          const parent = video.closest('[title], [aria-label], [data-title]');
          if (parent) {
            title = parent.getAttribute('title') ||
                   parent.getAttribute('aria-label') ||
                   parent.getAttribute('data-title') || '';
          }

          // 尝试从相邻元素获取标题
          if (!title) {
            const container = video.parentElement;
            if (container) {
              const heading = container.querySelector('h1, h2, h3, h4, h5, .title, [class*="title"]');
              if (heading) {
                title = heading.textContent || '';
              }
            }
          }
        }

        // 如果没找到标题，使用默认标题
        if (!title) {
          title = `Video ${index + 1}${video.currentTime > 0 ? ' (Playing)' : ''}`;
        }

        // 获取视频尺寸
        const width = video.videoWidth || video.clientWidth;
        const height = video.videoHeight || video.clientHeight;

        // 获取视频时长
        const duration = video.duration;
        const formattedDuration = isNaN(duration) ? '' : formatTime(duration);

        // 创建缩略图
        const thumbnail = createVideoThumbnail(video);

        return {
          video,
          title,
          dimensions: width && height ? `${width}x${height}` : '',
          duration: formattedDuration,
          thumbnail,
          isPlaying: !video.paused && !video.ended
        };
      });

      // 显示自定义选择器
      showCustomVideoPicker(videoInfos);
    }

    // 格式化时间
    function formatTime(seconds: number): string {
      if (isNaN(seconds)) return '';

      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 自定义视频选择器
    function showCustomVideoPicker(videoInfos: any[]) {
      // 移除已有选择器
      const existingPicker = document.getElementById('pip-video-picker');
      if (existingPicker) existingPicker.remove();

      // 创建选择器容器
      const picker = document.createElement('div');
      picker.id = 'pip-video-picker';
      picker.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // 创建选择器内容
      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        border-radius: 8px;
        width: 100%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        position: relative;
      `;
      picker.appendChild(content);

      // 添加关闭按钮
      const closeBtn = document.createElement('div');
      closeBtn.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #f3f4f6;
        color: #6b7280;
        font-size: 18px;
        font-weight: bold;
        transition: all 0.2s;
      `;
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => picker.remove();
      closeBtn.onmouseover = () => {
        closeBtn.style.background = '#e5e7eb';
        closeBtn.style.color = '#374151';
      };
      closeBtn.onmouseout = () => {
        closeBtn.style.background = '#f3f4f6';
        closeBtn.style.color = '#6b7280';
      };
      content.appendChild(closeBtn);

      // 标题
      const title = document.createElement('h2');
      title.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
        padding-right: 32px;
      `;
      title.textContent = 'Select a video for Picture-in-Picture mode';
      content.appendChild(title);

      // 视频列表
      const videoList = document.createElement('div');
      videoList.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
      `;

      // 添加视频项
      videoInfos.forEach((info, i) => {
        const videoItem = document.createElement('div');
        videoItem.style.cssText = `
          background: #f9f9f9;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #eee;
        `;

        videoItem.onmouseover = () => {
          videoItem.style.transform = 'translateY(-2px)';
          videoItem.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          videoItem.style.borderColor = '#ddd';
        };

        videoItem.onmouseout = () => {
          videoItem.style.transform = 'none';
          videoItem.style.boxShadow = 'none';
          videoItem.style.borderColor = '#eee';
        };

        // 缩略图
        let thumbnailHtml = `
          <div style="
            width: 100%;
            height: 90px;
            background: #eee;
            border-radius: 4px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 12px;
          ">No preview</div>
        `;

        if (info.thumbnail) {
          thumbnailHtml = `
            <div style="
              width: 100%;
              height: 90px;
              background-image: url('${info.thumbnail}');
              background-size: cover;
              background-position: center;
              border-radius: 4px;
              margin-bottom: 8px;
              position: relative;
            ">
              ${info.duration ? `<span style="
                position: absolute;
                bottom: 4px;
                right: 4px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
              ">${info.duration}</span>` : ''}
              ${info.isPlaying ? `<span style="
                position: absolute;
                top: 4px;
                left: 4px;
                background: rgba(66, 184, 131, 0.9);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
              ">Playing</span>` : ''}
            </div>
          `;
        }

        // 视频信息
        videoItem.innerHTML = `
          ${thumbnailHtml}
          <div style="font-weight: 500; margin-bottom: 4px; font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${info.title}
          </div>
          <div style="font-size: 12px; color: #888;">
            ${info.dimensions ? `Resolution: ${info.dimensions}` : ''}
          </div>
        `;

        // 点击激活画中画
        videoItem.onclick = () => {
          info.video.requestPictureInPicture().catch(() => {
            showToast('Unable to activate Picture-in-Picture mode', 'error');
          });
          picker.remove();
        };

        videoList.appendChild(videoItem);
      });

      content.appendChild(videoList);

      // 添加提示信息
      const tipText = document.createElement('div');
      tipText.style.cssText = `
        margin-top: 16px;
        font-size: 13px;
        color: #888;
        text-align: center;
      `;
      tipText.innerHTML = `
        <div>Tip: When in PiP mode, use <kbd style="background:#f0f0f0;padding:2px 5px;border-radius:3px;border:1px solid #ddd;">←</kbd> <kbd style="background:#f0f0f0;padding:2px 5px;border-radius:3px;border:1px solid #ddd;">→</kbd> arrow keys to switch videos</div>
      `;
      content.appendChild(tipText);

      // 添加到页面
      document.body.appendChild(picker);

      // 添加键盘导航
      picker.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          picker.remove();
        }
      });
    }

    // 检查当前网站是否在黑名单中
    async function checkIfDomainIsBlacklisted(): Promise<boolean> {
      const url = window.location.href;
      const allowed = await isUrlAllowed(url);
      return !allowed;
    }

    // 监听消息，实现画中画激活、多视频选择、探测等
    browser.runtime.onMessage.addListener(async (msg) => {
      // 处理画中画切换
      if (msg?.type === 'toggle-pip') {
        // 检查当前网站是否在黑名单中
        const isBlacklisted = await checkIfDomainIsBlacklisted();
        if (isBlacklisted) {
          showToast('Please remove this website from the blacklist to use PiP!', 'error');
          return;
        }

        // 优先使用右键菜单选中的视频
        if (lastContextMenuVideo && !lastContextMenuVideo.disablePictureInPicture) {
          lastContextMenuVideo.requestPictureInPicture().catch(() => {
            browser.runtime.sendMessage({ type: 'pip-error', reason: 'not-allowed' });
          });
          return;
        }

        // 如果没有右键选中的视频，则查找最佳视频
        const bestVideo = findBestVideoForPip();
        if (!bestVideo) {
          browser.runtime.sendMessage({ type: 'pip-error', reason: 'no-video' });
          return;
        }

        bestVideo.requestPictureInPicture().catch(() => {
          browser.runtime.sendMessage({ type: 'pip-error', reason: 'not-allowed' });
        });
        return;
      }

      // 探测页面是否有可用视频
      else if (msg?.type === 'probe-video') {
        const videos = getPlayableVideos();

        // 检查当前网站是否在黑名单中
        const isBlacklisted = await checkIfDomainIsBlacklisted();

        browser.runtime.sendMessage({
          type: 'probe-result',
          hasVideo: videos.length > 0,
          count: isBlacklisted ? 0 : videos.length
        });
      }

      // 显示视频选择器
      else if (msg?.type === 'show-video-picker') {
        // 检查当前网站是否在黑名单中
        const isBlacklisted = await checkIfDomainIsBlacklisted();
        if (isBlacklisted) {
          showToast('Please remove this website from the blacklist to use PiP!', 'error');
          return;
        }

        const videos = getAllFramesVideos();
        if (videos.length === 0) {
          browser.runtime.sendMessage({ type: 'pip-error', reason: 'no-video' });
        } else if (videos.length === 1) {
          videos[0].requestPictureInPicture();
        } else {
          // 使用增强版选择器
          showEnhancedVideoPicker(videos);
        }
      }

      // 显示提示消息
      else if (msg?.type === 'show-toast') {
        showToast(msg.reason || 'Operation failed', 'error');
      }
    });

    // 画中画窗口与原视频状态同步
    document.addEventListener('enterpictureinpicture', (e: any) => {
      const video = e.target as HTMLVideoElement;
      setPipVideo(video);
      syncToPiP(video);

      // 尝试添加画中画控件
      try {
        setTimeout(() => {
          addPipControls();
        }, 100);
      } catch (error) {
        console.error('Failed to add PiP controls:', error);
      }

      // 监听视频状态变化并同步
      video.addEventListener('timeupdate', () => syncToPiP(video), { passive: true });
      video.addEventListener('volumechange', () => syncToPiP(video), { passive: true });
      video.addEventListener('ratechange', () => syncToPiP(video), { passive: true });

      // 通知背景脚本更新图标
      browser.runtime.sendMessage({ type: 'pip-status-changed', active: true });
    });

    document.addEventListener('leavepictureinpicture', (e: any) => {
      const video = e.target as HTMLVideoElement;
      syncFromPiP(video);
      setPipVideo(null);

      // 通知背景脚本更新图标
      browser.runtime.sendMessage({ type: 'pip-status-changed', active: false });
    });

    // 初始化时通知背景脚本页面中的视频数量
    (async () => {
      const videos = getPlayableVideos();

      // 检查当前网站是否在黑名单中
      const isBlacklisted = await checkIfDomainIsBlacklisted();

      if (videos.length > 0 && !isBlacklisted) {
        browser.runtime.sendMessage({ type: 'video-detected', count: videos.length });
      }
    })();
  }
});

