<template>
  <div class="popup-container">
    <header class="header">
      <h1 class="title">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
        </svg>
        画中画视频
      </h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>检测视频中...</span>
      </div>

      <div v-else-if="videos.length === 0" class="no-videos">
        <svg class="no-video-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>当前页面未检测到视频</p>
        <small>请确保页面已完全加载</small>
      </div>

      <div v-else class="video-list">
        <div class="video-count">
          找到 {{ videos.length }} 个视频
        </div>
        
        <div 
          v-for="video in videos" 
          :key="video.id"
          class="video-item"
          @click="togglePip(video)"
        >
          <div class="video-info">
            <div class="video-title">{{ video.title }}</div>
            <div class="video-meta">
              <span class="platform">{{ video.platform }}</span>
              <span class="duration">{{ formatDuration(video.duration) }}</span>
              <span :class="['status', video.paused ? 'paused' : 'playing']">
                {{ video.paused ? '暂停' : '播放中' }}
              </span>
            </div>
          </div>
          
          <button class="pip-button" :disabled="!canPip(video)">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
            </svg>
          </button>
        </div>
      </div>
    </main>

    <footer class="footer">
      <button @click="openOptions" class="settings-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
        设置
      </button>
      
      <button @click="refreshVideos" class="refresh-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4c-4.42,0 -7.99,3.58 -7.99,8s3.57,8 7.99,8c3.73,0 6.84,-2.55 7.73,-6h-2.08c-0.82,2.33 -3.04,4 -5.65,4 -3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6c1.66,0 3.14,0.69 4.22,1.78L13,11h7V4L17.65,6.35z"/>
        </svg>
        刷新
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MESSAGE_TYPES, type VideoInfo } from '~/utils/types'
import { formatTime } from '~/utils/helpers'
import { chrome } from 'vue-chrome-extension'

const loading = ref(true)
const videos = ref<VideoInfo[]>([])

const loadVideos = async () => {
  try {
    loading.value = true
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!activeTab.id) return
    
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      type: MESSAGE_TYPES.GET_VIDEOS
    })
    
    videos.value = response || []
  } catch (error) {
    console.error('Failed to load videos:', error)
    videos.value = []
  } finally {
    loading.value = false
  }
}

const togglePip = async (video: VideoInfo) => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!activeTab.id) return
    
    await chrome.tabs.sendMessage(activeTab.id, {
      type: MESSAGE_TYPES.TOGGLE_PIP,
      videoId: video.id
    })
    
    // 关闭popup
    window.close()
  } catch (error) {
    console.error('Failed to toggle PiP:', error)
  }
}

const canPip = (video: VideoInfo): boolean => {
  return video.duration > 0 && !video.paused
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return '--:--'
  return formatTime(seconds)
}

const refreshVideos = () => {
  loadVideos()
}

const openOptions = () => {
  chrome.runtime.openOptionsPage()
  window.close()
}

onMounted(() => {
  loadVideos()
})
</script>

<style>
.popup-container {
  width: 320px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 20px;
  height: 20px;
}

.content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e5e9;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-videos {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-video-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.video-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.video-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.video-info {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.platform {
  background: #e1e5e9;
  padding: 2px 6px;
  border-radius: 3px;
}

.status.playing {
  color: #22c55e;
}

.status.paused {
  color: #f59e0b;
}

.pip-button {
  width: 36px;
  height: 36px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.pip-button:hover:not(:disabled) {
  background: #5a67d8;
}

.pip-button:disabled {
  background: #e1e5e9;
  cursor: not-allowed;
}

.pip-button svg {
  width: 18px;
  height: 18px;
}

.footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
}

.settings-button,
.refresh-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.settings-button:hover,
.refresh-button:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.settings-button svg,
.refresh-button svg {
  width: 16px;
  height: 16px;
}
</style>
