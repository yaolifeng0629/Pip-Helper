// 注入脚本，用于与页面上下文交互
// 某些平台可能需要在页面上下文中执行代码来获取视频信息

interface InjectedAPI {
  getPlatformVideos: () => HTMLVideoElement[]
  getPlatformInfo: () => { name: string; version?: string }
}

class InjectedScript {
  private api: InjectedAPI

  constructor() {
    this.api = {
      getPlatformVideos: this.getPlatformVideos.bind(this),
      getPlatformInfo: this.getPlatformInfo.bind(this),
    }

    this.init()
  }

  private init() {
    // 将API暴露给content script
    ;(window as any).__PIP_EXTENSION_API__ = this.api

    // 监听来自content script的消息
    window.addEventListener("message", this.handleMessage.bind(this))

    console.log("PiP Extension injected script loaded")
  }

  private handleMessage(event: MessageEvent) {
    if (event.source !== window) return

    const { type, data } = event.data

    switch (type) {
      case "PIP_GET_PLATFORM_VIDEOS":
        const videos = this.getPlatformVideos()
        window.postMessage(
          {
            type: "PIP_PLATFORM_VIDEOS_RESPONSE",
            data: videos.map((v) => ({
              src: v.src || v.currentSrc,
              duration: v.duration,
              currentTime: v.currentTime,
              paused: v.paused,
            })),
          },
          "*",
        )
        break
    }
  }

  private getPlatformVideos(): HTMLVideoElement[] {
    const hostname = window.location.hostname

    // YouTube特殊处理
    if (hostname.includes("youtube.com")) {
      return this.getYouTubeVideos()
    }

    // Bilibili特殊处理
    if (hostname.includes("bilibili.com")) {
      return this.getBilibiliVideos()
    }

    // 默认HTML5视频检测
    return Array.from(document.querySelectorAll("video"))
  }

  private getYouTubeVideos(): HTMLVideoElement[] {
    // YouTube的视频元素通常在特定的容器中
    const containers = [".html5-video-player video", "#movie_player video", ".ytp-html5-video"]

    for (const selector of containers) {
      const videos = document.querySelectorAll(selector) as NodeListOf<HTMLVideoElement>
      if (videos.length > 0) {
        return Array.from(videos)
      }
    }

    return Array.from(document.querySelectorAll("video"))
  }

  private getBilibiliVideos(): HTMLVideoElement[] {
    // Bilibili的视频元素
    const selectors = [".bpx-player-video-wrap video", ".bilibili-player-video video", "bwp-video", "video"]

    for (const selector of selectors) {
      const videos = document.querySelectorAll(selector) as NodeListOf<HTMLVideoElement>
      if (videos.length > 0) {
        return Array.from(videos)
      }
    }

    return []
  }

  private getPlatformInfo(): { name: string; version?: string } {
    const hostname = window.location.hostname

    if (hostname.includes("youtube.com")) {
      return { name: "YouTube" }
    }

    if (hostname.includes("bilibili.com")) {
      return { name: "Bilibili" }
    }

    if (hostname.includes("netflix.com")) {
      return { name: "Netflix" }
    }

    return { name: "Unknown" }
  }
}

// 初始化注入脚本
new InjectedScript()
