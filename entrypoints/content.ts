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

        // 绘制视频当前帧
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 转为 data URL
        return canvas.toDataURL('image/jpeg', 0.7);
      } catch (e) {
        console.error('创建视频缩略图失败:', e);
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
          const parent = video.closest('[title], [aria-label]');
          if (parent) {
            title = parent.getAttribute('title') || parent.getAttribute('aria-label') || '';
          }
        }

        // 如果没找到标题，使用默认标题
        if (!title) {
          title = `视频 ${index + 1}${video.currentTime > 0 ? ' (正在播放)' : ''}`;
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
        z-index: 999999;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 32px rgba(0, 0, 0, 0.2);
        padding: 20px;
        width: 480px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // 添加标题
      const title = document.createElement('div');
      title.style.cssText = `
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      title.innerHTML = `<span>选择要画中画的视频</span>`;

      // 添加关闭按钮
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #888;
        padding: 0 8px;
      `;
      closeBtn.onclick = () => picker.remove();
      title.appendChild(closeBtn);

      picker.appendChild(title);

      // 创建视频列表
      const videoList = document.createElement('div');
      videoList.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      `;

      // 添加视频项
      videoInfos.forEach((info, i) => {
        const videoItem = document.createElement('div');
        videoItem.style.cssText = `
          background: ${info.isPlaying ? 'rgba(66, 184, 131, 0.1)' : '#f9f9f9'};
          border: 1px solid ${info.isPlaying ? 'rgba(66, 184, 131, 0.3)' : '#eee'};
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          ${info.isPlaying ? 'box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);' : ''}
        `;
        videoItem.onmouseover = () => {
          videoItem.style.background = info.isPlaying ? 'rgba(66, 184, 131, 0.15)' : '#f0f0f0';
        };
        videoItem.onmouseout = () => {
          videoItem.style.background = info.isPlaying ? 'rgba(66, 184, 131, 0.1)' : '#f9f9f9';
        };

        // 添加缩略图
        let thumbnailHtml = '';
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
              ">正在播放</span>` : ''}
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
            ${info.dimensions ? `分辨率: ${info.dimensions}` : ''}
          </div>
        `;

        // 点击激活画中画
        videoItem.onclick = () => {
          info.video.requestPictureInPicture().catch(() => {
            showToast('无法激活画中画模式', 'error');
          });
          picker.remove();
        };

        videoList.appendChild(videoItem);
      });

      picker.appendChild(videoList);

      // 添加提示信息
      const tipText = document.createElement('div');
      tipText.style.cssText = `
        margin-top: 16px;
        font-size: 13px;
        color: #888;
        text-align: center;
      `;
      tipText.innerHTML = `
        <div>提示: 进入画中画后，可使用<kbd style="background:#f0f0f0;padding:2px 5px;border-radius:3px;border:1px solid #ddd;">←</kbd> <kbd style="background:#f0f0f0;padding:2px 5px;border-radius:3px;border:1px solid #ddd;">→</kbd>方向键切换视频</div>
      `;
      picker.appendChild(tipText);

      // 添加到页面
      document.body.appendChild(picker);

      // 添加键盘导航
      picker.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          picker.remove();
        }
      });
    }

    // 监听消息，实现画中画激活、多视频选择、探测等
    browser.runtime.onMessage.addListener((msg) => {
      // 处理画中画切换
      if (msg?.type === 'toggle-pip') {
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
        browser.runtime.sendMessage({
          type: 'probe-result',
          hasVideo: videos.length > 0,
          count: videos.length
        });
      }

      // 显示视频选择器
      else if (msg?.type === 'show-video-picker') {
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
        showToast(msg.reason || '操作失败', 'error');
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
        console.error('添加画中画控件失败:', error);
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
    const videos = getPlayableVideos();
    if (videos.length > 0) {
      browser.runtime.sendMessage({ type: 'video-detected', count: videos.length });
    }
  },
});

