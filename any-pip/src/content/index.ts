import { defineContentScript } from "wxt/content-script"
import { MESSAGE_TYPES, type VideoInfo } from "~/utils/types"
import { getCurrentAdapter } from "~/utils/platform-adapters"
import { debounce, isVideoPlaying } from "~/utils/helpers"
import { chrome } from "wxt/chrome"

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  main() {
    const contentScript = new ContentScript()
    contentScript.init()
  },
})

class ContentScript {
  private videos: HTMLVideoElement[] = []
  private currentPipVideo: HTMLVideoElement | null = null
  private observer: MutationObserver | null = null
  private adapter = getCurrentAdapter()

  init() {
    // 监听来自background的消息
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))

    // 初始检测视频
    this.detectVideos()

    // 监听DOM变化
    this.observeDOM()

    // 监听画中画事件
    this.listenPipEvents()

    console.log(`PiP Extension loaded on ${this.adapter.name}`)
  }

  private handleMessage = async (message: any) => {
    switch (message.type) {
      case MESSAGE_TYPES.TOGGLE_PIP:
        await this.togglePictureInPicture()
        break

      case MESSAGE_TYPES.GET_VIDEOS:
        return this.getVideoInfos()
    }
  }

  private detectVideos = debounce(() => {
    const newVideos = this.adapter.detect()

    // 移除已经不存在的视频的事件监听
    this.videos.forEach((video) => {
      if (!newVideos.includes(video)) {
        this.removeVideoListeners(video)
      }
    })

    // 为新视频添加事件监听
    newVideos.forEach((video) => {
      if (!this.videos.includes(video)) {
        this.addVideoListeners(video)
      }
    })

    this.videos = newVideos

    // 通知background脚本
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.VIDEO_DETECTED,
      count: this.videos.length,
    })
  }, 500)

  private addVideoListeners(video: HTMLVideoElement) {
    const events = ["play", "pause", "ended", "loadedmetadata"]
    events.forEach((event) => {
      video.addEventListener(event, this.handleVideoEvent.bind(this))
    })
  }

  private removeVideoListeners(video: HTMLVideoElement) {
    const events = ["play", "pause", "ended", "loadedmetadata"]
    events.forEach((event) => {
      video.removeEventListener(event, this.handleVideoEvent.bind(this))
    })
  }

  private handleVideoEvent = (event: Event) => {
    const video = event.target as HTMLVideoElement

    // 如果视频开始播放且支持PiP，可以考虑自动激活（根据用户设置）
    if (event.type === "play" && this.adapter.canPiP(video)) {
      // 这里可以添加自动激活逻辑
    }
  }

  private observeDOM() {
    this.observer = new MutationObserver((mutations) => {
      let shouldDetect = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName === "VIDEO" || element.querySelector("video")) {
                shouldDetect = true
              }
            }
          })
        }
      })

      if (shouldDetect) {
        this.detectVideos()
      }
    })

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  private listenPipEvents() {
    document.addEventListener("enterpictureinpicture", (event) => {
      this.currentPipVideo = event.target as HTMLVideoElement
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.PIP_STATUS_CHANGED,
        active: true,
      })
    })

    document.addEventListener("leavepictureinpicture", (event) => {
      this.currentPipVideo = null
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.PIP_STATUS_CHANGED,
        active: false,
      })
    })
  }

  private async togglePictureInPicture() {
    try {
      // 如果已经有PiP视频，则退出
      if (this.currentPipVideo) {
        await document.exitPictureInPicture()
        return
      }

      // 找到最适合的视频进行PiP
      const targetVideo = this.findBestVideoForPip()

      if (!targetVideo) {
        this.showNotification("未找到可播放的视频")
        return
      }

      if (!this.adapter.canPiP(targetVideo)) {
        this.showNotification("当前视频不支持画中画")
        return
      }

      await targetVideo.requestPictureInPicture()
    } catch (error) {
      console.error("PiP toggle failed:", error)
      this.showNotification("画中画激活失败")
    }
  }

  private findBestVideoForPip(): HTMLVideoElement | null {
    // 优先选择正在播放的视频
    const playingVideos = this.videos.filter(isVideoPlaying)
    if (playingVideos.length > 0) {
      return playingVideos[0]
    }

    // 其次选择最大的视频
    const visibleVideos = this.videos.filter((video) => {
      const rect = video.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    })

    if (visibleVideos.length === 0) return null

    return visibleVideos.reduce((largest, current) => {
      const largestRect = largest.getBoundingClientRect()
      const currentRect = current.getBoundingClientRect()
      const largestArea = largestRect.width * largestRect.height
      const currentArea = currentRect.width * currentRect.height
      return currentArea > largestArea ? current : largest
    })
  }

  private getVideoInfos(): VideoInfo[] {
    return this.videos.map((video) => this.adapter.getVideoInfo(video))
  }

  private showNotification(message: string) {
    // 创建简单的通知
    const notification = document.createElement("div")
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
}
