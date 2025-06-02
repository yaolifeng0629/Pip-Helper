import Plyr from 'plyr';

/**
 * 视频平台适配器接口
 */
interface PlatformAdapter {
    name: string;
    match: (url: string) => boolean;
    getVideos: () => HTMLVideoElement[];
    getPlayingVideo?: () => HTMLVideoElement | null;
    onVideoReady?: (callback: (video: HTMLVideoElement) => void) => void;
}

/**
 * 画中画管理器类
 */
class PictureInPictureManager {
    private currentPipVideo: HTMLVideoElement | null = null;
    private videoState: {
        currentTime: number;
        volume: number;
        playbackRate: number;
        paused: boolean;
    } = { currentTime: 0, volume: 1, playbackRate: 1, paused: false };

    private lastContextMenuVideo: HTMLVideoElement | null = null;
    private platforms: PlatformAdapter[] = [];
    private observer: MutationObserver | null = null;
    private toastTimer: number | null = null;

    constructor() {
        this.initializePlatforms();
        this.setupEventListeners();
        this.setupMutationObserver();
    }

    /**
     * 初始化平台适配器
     */
    private initializePlatforms(): void {
        this.platforms = [
            // YouTube 适配器
            {
                name: 'YouTube',
                match: (url: string) => /youtube\.com|youtu\.be/.test(url),
                getVideos: () => {
                    const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
                    return videos.filter(v => v.readyState > 0 && !v.disablePictureInPicture);
                },
                getPlayingVideo: () => {
                    const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
                    return videos.find(v => !v.paused && !v.ended && v.readyState > 0) || null;
                },
            },

            // Bilibili 适配器
            {
                name: 'Bilibili',
                match: (url: string) => /bilibili\.com/.test(url),
                getVideos: () => {
                    const videos = Array.from(
                        document.querySelectorAll('video, .bilibili-player-video video')
                    ) as HTMLVideoElement[];
                    return videos.filter(v => v.readyState > 0 && !v.disablePictureInPicture);
                },
                getPlayingVideo: () => {
                    const videos = Array.from(
                        document.querySelectorAll('video, .bilibili-player-video video')
                    ) as HTMLVideoElement[];
                    return videos.find(v => !v.paused && !v.ended && v.readyState > 0) || null;
                },
            },

            // 微信公众号适配器
            {
                name: 'WeChat',
                match: (url: string) => /mp\.weixin\.qq\.com/.test(url),
                getVideos: () => {
                    let videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];

                    // 微信公众号特殊处理：readyState 可能为 0 但仍可用
                    videos = videos.filter(
                        v => !v.disablePictureInPicture && (v.readyState > 0 || v.src || v.currentSrc)
                    );

                    // 查找微信视频容器内的视频
                    const wxContainers = document.querySelectorAll('.video_iframe, .video_area, .js_video_area');
                    wxContainers.forEach(container => {
                        const v = container.querySelector('video') as HTMLVideoElement;
                        if (v && !videos.includes(v) && !v.disablePictureInPicture) {
                            videos.push(v);
                        }
                    });

                    return videos;
                },
            },

            // 通用适配器（兜底方案）
            {
                name: 'Generic',
                match: () => true, // 匹配所有网站
                getVideos: () => {
                    const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
                    return videos.filter(v => v.readyState > 0 && !v.disablePictureInPicture);
                },
                getPlayingVideo: () => {
                    const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
                    return videos.find(v => !v.paused && !v.ended && v.readyState > 0) || null;
                },
            },
        ];
    }

    /**
     * 获取当前页面的平台适配器
     */
    private getCurrentPlatform(): PlatformAdapter {
        const currentUrl = window.location.href;
        return this.platforms.find(platform => platform.match(currentUrl)) || this.platforms[this.platforms.length - 1];
    }

    /**
     * 获取当前页面所有可用的视频元素
     */
    private getPlayableVideos(): HTMLVideoElement[] {
        const platform = this.getCurrentPlatform();
        let videos = platform.getVideos();

        // 同时检查所有同源 iframe 内的视频
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const iframeVideos = Array.from(iframeDoc.querySelectorAll('video')) as HTMLVideoElement[];
                    const validIframeVideos = iframeVideos.filter(v => v.readyState > 0 && !v.disablePictureInPicture);
                    videos.push(...validIframeVideos);
                }
            } catch (e) {
                // 跨域 iframe 无法访问，忽略错误
                console.debug('Cannot access iframe content (cross-origin):', e);
            }
        });

        return videos;
    }

    /**
     * 获取正在播放的视频
     */
    private getPlayingVideo(): HTMLVideoElement | null {
        const platform = this.getCurrentPlatform();

        if (platform.getPlayingVideo) {
            return platform.getPlayingVideo();
        }

        // 兜底逻辑
        const videos = this.getPlayableVideos();
        return videos.find(v => !v.paused && !v.ended) || null;
    }

    /**
     * 使用 Plyr 增强视频元素
     */
    private enhanceVideoWithPlyr(video: HTMLVideoElement): void {
        if ((video as any)._plyr || (video as any)._pipEnhanced) return;

        try {
            const plyr = new Plyr(video, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'settings',
                    'pip',
                    'fullscreen',
                ],
                tooltips: { controls: true, seek: true },
                previewThumbnails: { enabled: true },
                settings: ['quality', 'speed', 'loop'],
                i18n: {
                    pip: '画中画',
                    play: '播放',
                    pause: '暂停',
                    mute: '静音',
                    unmute: '取消静音',
                    volume: '音量',
                    fullscreen: '全屏',
                    exitFullscreen: '退出全屏',
                },
            });

            (video as any)._plyr = plyr;
            (video as any)._pipEnhanced = true;

            console.debug('Enhanced video with Plyr:', video);
        } catch (error) {
            console.warn('Failed to enhance video with Plyr:', error);
            (video as any)._pipEnhanced = true; // 标记为已处理，避免重复尝试
        }
    }

    /**
     * 增强所有视频
     */
    private enhanceAllVideos(): void {
        const videos = this.getPlayableVideos();
        videos.forEach(video => this.enhanceVideoWithPlyr(video));

        // 通知背景脚本视频数量
        this.notifyVideoCount(videos.length);
    }

    /**
     * 设置右键菜单监听
     */
    private setupContextMenuListeners(): void {
        const videos = this.getPlayableVideos();

        videos.forEach(video => {
            if (!(video as any)._pipContextMenuBound) {
                video.addEventListener('contextmenu', () => {
                    this.lastContextMenuVideo = video;
                    console.debug('Context menu triggered on video:', video);
                });
                (video as any)._pipContextMenuBound = true;
            }

            // 为微信视频容器也绑定右键菜单
            const wxParent = video.closest('.video_iframe, .video_area, .js_video_area');
            if (wxParent && !(wxParent as any)._pipContextMenuBound) {
                wxParent.addEventListener('contextmenu', () => {
                    this.lastContextMenuVideo = video;
                });
                (wxParent as any)._pipContextMenuBound = true;
            }
        });
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 监听画中画进入事件
        document.addEventListener('enterpictureinpicture', (e: Event) => {
            const video = e.target as HTMLVideoElement;
            this.currentPipVideo = video;
            this.saveVideoState(video);

            // 持续同步状态
            video.addEventListener('timeupdate', () => this.saveVideoState(video), { passive: true });
            video.addEventListener('volumechange', () => this.saveVideoState(video), { passive: true });
            video.addEventListener('ratechange', () => this.saveVideoState(video), { passive: true });
            video.addEventListener('play', () => this.saveVideoState(video), { passive: true });
            video.addEventListener('pause', () => this.saveVideoState(video), { passive: true });

            // 通知背景脚本
            this.notifyPipStatusChange(true);
            console.log('Entered Picture-in-Picture mode:', video);
        });

        // 监听画中画退出事件
        document.addEventListener('leavepictureinpicture', (e: Event) => {
            const video = e.target as HTMLVideoElement;
            if (this.currentPipVideo === video) {
                this.restoreVideoState(video);
                this.currentPipVideo = null;
            }

            // 通知背景脚本
            this.notifyPipStatusChange(false);
            console.log('Left Picture-in-Picture mode:', video);
        });

        // 快捷键支持：Alt+B 返回原始标签页
        window.addEventListener('keydown', e => {
            if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                window.focus();
                this.showToast('已返回原始标签页');
            }
        });

        // 监听来自背景脚本的消息
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
        });
    }

    /**
     * 设置 DOM 变化监听器
     */
    private setupMutationObserver(): void {
        this.observer = new MutationObserver(mutations => {
            let shouldUpdate = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (element.tagName === 'VIDEO' || element.querySelector('video')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });

            if (shouldUpdate) {
                // 防抖处理，避免频繁更新
                setTimeout(() => {
                    this.enhanceAllVideos();
                    this.setupContextMenuListeners();
                }, 100);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * 保存视频状态
     */
    private saveVideoState(video: HTMLVideoElement): void {
        this.videoState = {
            currentTime: video.currentTime,
            volume: video.volume,
            playbackRate: video.playbackRate,
            paused: video.paused,
        };
    }

    /**
     * 恢复视频状态
     */
    private restoreVideoState(video: HTMLVideoElement): void {
        try {
            video.currentTime = this.videoState.currentTime;
            video.volume = this.videoState.volume;
            video.playbackRate = this.videoState.playbackRate;

            if (!this.videoState.paused && video.paused) {
                video.play().catch(e => console.warn('Failed to resume video playback:', e));
            }
        } catch (error) {
            console.warn('Failed to restore video state:', error);
        }
    }

    /**
     * 激活画中画
     */
    private async activatePictureInPicture(targetVideo?: HTMLVideoElement): Promise<boolean> {
        try {
            let video: HTMLVideoElement | null = null;

            if (targetVideo) {
                video = targetVideo;
            } else if (this.lastContextMenuVideo && !this.lastContextMenuVideo.disablePictureInPicture) {
                // 优先使用右键菜单选中的视频
                video = this.lastContextMenuVideo;
            } else {
                // 自动选择视频：优先正在播放的，否则选择第一个可用的
                const playingVideo = this.getPlayingVideo();
                const allVideos = this.getPlayableVideos();
                video = playingVideo || allVideos[0] || null;
            }

            if (!video) {
                this.notifyError('no-video');
                return false;
            }

            if (video.disablePictureInPicture) {
                this.notifyError('not-allowed');
                return false;
            }

            await video.requestPictureInPicture();
            return true;
        } catch (error) {
            console.error('Failed to activate Picture-in-Picture:', error);
            this.notifyError('not-allowed');
            return false;
        }
    }

    /**
     * 显示视频选择器
     */
    private showVideoSelector(videos: HTMLVideoElement[]): void {
        // 移除已存在的选择器
        const existingPicker = document.getElementById('pip-video-selector');
        if (existingPicker) {
            existingPicker.remove();
        }

        const selector = document.createElement('div');
        selector.id = 'pip-video-selector';
        selector.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      padding: 20px;
      min-width: 300px;
      max-width: 500px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    `;

        const title = document.createElement('h3');
        title.textContent = '选择要画中画的视频';
        title.style.cssText = 'margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;';
        selector.appendChild(title);

        videos.forEach((video, index) => {
            const button = document.createElement('button');
            const videoTitle = this.getVideoTitle(video, index);
            button.textContent = videoTitle;
            button.style.cssText = `
        display: block;
        width: 100%;
        margin-bottom: 8px;
        padding: 12px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #f8f9fa;
        color: #333;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        font-size: 14px;
      `;

            button.addEventListener('mouseenter', () => {
                button.style.background = '#e3f2fd';
                button.style.borderColor = '#2196f3';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = '#f8f9fa';
                button.style.borderColor = '#e0e0e0';
            });

            button.addEventListener('click', async () => {
                selector.remove();
                await this.activatePictureInPicture(video);
            });

            selector.appendChild(button);
        });

        // 取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.cssText = `
      display: block;
      width: 100%;
      margin-top: 8px;
      padding: 12px 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #f0f0f0;
      color: #666;
      cursor: pointer;
      font-size: 14px;
    `;

        cancelButton.addEventListener('click', () => selector.remove());
        selector.appendChild(cancelButton);

        document.body.appendChild(selector);

        // 3秒后自动关闭
        setTimeout(() => {
            if (selector.parentNode) {
                selector.remove();
            }
        }, 10000);
    }

    /**
     * 获取视频标题
     */
    private getVideoTitle(video: HTMLVideoElement, index: number): string {
        // 尝试从视频元素或其父元素获取标题
        const title =
            video.title ||
            video.getAttribute('aria-label') ||
            video.closest('[title]')?.getAttribute('title') ||
            video.currentSrc ||
            video.src ||
            `视频 ${index + 1}`;

        return title.length > 50 ? title.substring(0, 50) + '...' : title;
    }

    /**
     * 显示提示消息
     */
    private showToast(message: string): void {
        // 清除之前的提示
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        const existingToast = document.getElementById('pip-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'pip-toast';
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

        document.body.appendChild(toast);

        // 动画显示
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // 3秒后自动隐藏
        this.toastTimer = window.setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * 处理消息
     */
    private handleMessage(message: any, sender: any, sendResponse: (response?: any) => void): void {
        switch (message?.type) {
            case 'toggle-pip':
                this.activatePictureInPicture();
                break;

            case 'activate-pip':
                this.activatePictureInPicture();
                break;

            case 'probe-video':
                const videos = this.getPlayableVideos();
                sendResponse({
                    type: 'probe-result',
                    hasVideo: videos.length > 0,
                    videoCount: videos.length,
                    platform: this.getCurrentPlatform().name,
                });
                break;

            case 'show-video-selector':
                const availableVideos = this.getPlayableVideos();
                if (availableVideos.length === 0) {
                    this.notifyError('no-video');
                } else if (availableVideos.length === 1) {
                    this.activatePictureInPicture(availableVideos[0]);
                } else {
                    this.showVideoSelector(availableVideos);
                }
                break;

            case 'show-toast':
                this.showToast(message.message || '操作完成');
                break;

            default:
                console.debug('Unknown message type:', message?.type);
        }
    }

    /**
     * 通知背景脚本错误信息
     */
    private notifyError(reason: string): void {
        browser.runtime.sendMessage({
            type: 'pip-error',
            reason: reason,
        });
    }

    /**
     * 通知背景脚本画中画状态变化
     */
    private notifyPipStatusChange(active: boolean): void {
        browser.runtime.sendMessage({
            type: 'pip-status-changed',
            active: active,
        });
    }

    /**
     * 通知背景脚本视频数量
     */
    private notifyVideoCount(count: number): void {
        browser.runtime.sendMessage({
            type: 'video-detected',
            count: count,
        });
    }

    /**
     * 初始化管理器
     */
    public initialize(): void {
        // 等待页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.enhanceAllVideos();
                this.setupContextMenuListeners();
            });
        } else {
            this.enhanceAllVideos();
            this.setupContextMenuListeners();
        }

        console.log('Picture-in-Picture Manager initialized');
    }

    /**
     * 销毁管理器
     */
    public destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
            this.toastTimer = null;
        }

        // 清理选择器和提示
        const selector = document.getElementById('pip-video-selector');
        if (selector) selector.remove();

        const toast = document.getElementById('pip-toast');
        if (toast) toast.remove();

        console.log('Picture-in-Picture Manager destroyed');
    }
}

// 内容脚本入口点
export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        // 创建画中画管理器实例
        const pipManager = new PictureInPictureManager();

        // 初始化管理器
        pipManager.initialize();

        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            pipManager.destroy();
        });

        console.log('Content script loaded successfully');
    },
});
