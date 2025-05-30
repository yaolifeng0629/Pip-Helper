import type { PlatformAdapter, VideoInfo } from "./types"
import { generateVideoId, isVideoPlaying } from "./helpers"

// 基础HTML5视频适配器
export const html5Adapter: PlatformAdapter = {
  name: "HTML5",
  domains: ["*"],
  detect: (): HTMLVideoElement[] => {
    return Array.from(document.querySelectorAll("video"))
  },
  getVideoInfo: (video: HTMLVideoElement): VideoInfo => {
    return {
      id: generateVideoId(video),
      title: video.title || document.title,
      duration: video.duration || 0,
      currentTime: video.currentTime || 0,
      paused: video.paused,
      platform: "HTML5",
      element: video,
    }
  },
  canPiP: (video: HTMLVideoElement): boolean => {
    return "pictureInPictureEnabled" in document && !video.disablePictureInPicture
  },
}

// YouTube适配器
export const youtubeAdapter: PlatformAdapter = {
  name: "YouTube",
  domains: ["youtube.com", "www.youtube.com", "youtu.be"],
  detect: (): HTMLVideoElement[] => {
    const videos = Array.from(document.querySelectorAll("video"))
    return videos.filter((video) => video.src || video.querySelector("source"))
  },
  getVideoInfo: (video: HTMLVideoElement): VideoInfo => {
    const titleElement =
      document.querySelector("h1.ytd-video-primary-info-renderer") || document.querySelector("[data-title]")
    const title = titleElement?.textContent || document.title

    return {
      id: generateVideoId(video),
      title: title.replace(" - YouTube", ""),
      duration: video.duration || 0,
      currentTime: video.currentTime || 0,
      paused: video.paused,
      platform: "YouTube",
      element: video,
    }
  },
  canPiP: (video: HTMLVideoElement): boolean => {
    return html5Adapter.canPiP(video) && isVideoPlaying(video)
  },
}

// Bilibili适配器
export const bilibiliAdapter: PlatformAdapter = {
  name: "Bilibili",
  domains: ["bilibili.com", "www.bilibili.com"],
  detect: (): HTMLVideoElement[] => {
    return Array.from(document.querySelectorAll("video, bwp-video"))
  },
  getVideoInfo: (video: HTMLVideoElement): VideoInfo => {
    const titleElement = document.querySelector(".video-title") || document.querySelector("h1[title]")
    const title = titleElement?.textContent || titleElement?.getAttribute("title") || document.title

    return {
      id: generateVideoId(video),
      title: title.replace("_哔哩哔哩_bilibili", ""),
      duration: video.duration || 0,
      currentTime: video.currentTime || 0,
      paused: video.paused,
      platform: "Bilibili",
      element: video,
    }
  },
  canPiP: (video: HTMLVideoElement): boolean => {
    return html5Adapter.canPiP(video)
  },
}

// Netflix适配器
export const netflixAdapter: PlatformAdapter = {
  name: "Netflix",
  domains: ["netflix.com", "www.netflix.com"],
  detect: (): HTMLVideoElement[] => {
    return Array.from(document.querySelectorAll("video"))
  },
  getVideoInfo: (video: HTMLVideoElement): VideoInfo => {
    const titleElement = document.querySelector(".video-title") || document.querySelector('[data-uia="video-title"]')
    const title = titleElement?.textContent || document.title

    return {
      id: generateVideoId(video),
      title: title.replace(" - Netflix", ""),
      duration: video.duration || 0,
      currentTime: video.currentTime || 0,
      paused: video.paused,
      platform: "Netflix",
      element: video,
    }
  },
  canPiP: (video: HTMLVideoElement): boolean => {
    return html5Adapter.canPiP(video) && !video.classList.contains("netflix-pip-disabled")
  },
}

export const platformAdapters: PlatformAdapter[] = [
  youtubeAdapter,
  bilibiliAdapter,
  netflixAdapter,
  html5Adapter, // 放在最后作为fallback
]

export const getCurrentAdapter = (): PlatformAdapter => {
  const currentDomain = window.location.hostname
  return (
    platformAdapters.find((adapter) =>
      adapter.domains.some((domain) => domain === "*" || currentDomain.includes(domain)),
    ) || html5Adapter
  )
}
