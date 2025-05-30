export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

export const getCurrentDomain = (): string => {
  return window.location.hostname
}

export const isVideoPlaying = (video: HTMLVideoElement): boolean => {
  return !video.paused && !video.ended && video.readyState > 2
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export const generateVideoId = (video: HTMLVideoElement): string => {
  const src = video.src || video.currentSrc
  const rect = video.getBoundingClientRect()
  return `video_${src.slice(-20)}_${rect.width}x${rect.height}`
}
