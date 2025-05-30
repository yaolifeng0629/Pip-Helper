export interface VideoInfo {
  id: string
  title: string
  duration: number
  currentTime: number
  paused: boolean
  platform: string
  element?: HTMLVideoElement
}

export interface PlatformAdapter {
  name: string
  domains: string[]
  detect: () => HTMLVideoElement[]
  getVideoInfo: (video: HTMLVideoElement) => VideoInfo
  canPiP: (video: HTMLVideoElement) => boolean
}

export interface ExtensionSettings {
  enabledSites: string[]
  disabledSites: string[]
  shortcutKey: string
  autoActivate: boolean
  showNotifications: boolean
}

export interface MessageType {
  TOGGLE_PIP: "TOGGLE_PIP"
  GET_VIDEOS: "GET_VIDEOS"
  VIDEO_DETECTED: "VIDEO_DETECTED"
  PIP_STATUS_CHANGED: "PIP_STATUS_CHANGED"
  UPDATE_SETTINGS: "UPDATE_SETTINGS"
}

export const MESSAGE_TYPES: MessageType = {
  TOGGLE_PIP: "TOGGLE_PIP",
  GET_VIDEOS: "GET_VIDEOS",
  VIDEO_DETECTED: "VIDEO_DETECTED",
  PIP_STATUS_CHANGED: "PIP_STATUS_CHANGED",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
}
