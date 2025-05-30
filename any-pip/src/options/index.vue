<template>
  <div class="options-container">
    <header class="header">
      <h1>画中画扩展设置</h1>
      <p>配置您的画中画体验</p>
    </header>

    <main class="main">
      <div class="settings-section">
        <h2>基本设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.autoActivate"
              @change="saveSettings"
            >
            <span class="checkmark"></span>
            自动激活画中画
          </label>
          <p class="setting-description">
            当视频开始播放时自动进入画中画模式
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.showNotifications"
              @change="saveSettings"
            >
            <span class="checkmark"></span>
            显示通知
          </label>
          <p class="setting-description">
            显示画中画状态变化的通知消息
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>快捷键设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            画中画切换快捷键
          </label>
          <div class="shortcut-display">
            <kbd>{{ settings.shortcutKey }}</kbd>
            <button @click="changeShortcut" class="change-button">
              修改
            </button>
          </div>
          <p class="setting-description">
            点击修改按钮后，按下您想要的快捷键组合
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>网站管理</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            启用的网站
          </label>
          <div class="site-list">
            <div 
              v-for="site in settings.enabledSites" 
              :key="site"
              class="site-item enabled"
            >
              <span>{{ site }}</span>
              <button @click="removeSite(site, 'enabled')" class="remove-button">
                ×
              </button>
            </div>
            <div class="add-site">
              <input 
                v-model="newEnabledSite"
                placeholder="添加网站域名..."
                @keyup.enter="addSite('enabled')"
                class="site-input"
              >
              <button @click="addSite('enabled')" class="add-button">
                添加
              </button>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            禁用的网站
          </label>
          <div class="site-list">
            <div 
              v-for="site in settings.disabledSites" 
              :key="site"
              class="site-item disabled"
            >
              <span>{{ site }}</span>
              <button @click="removeSite(site, 'disabled')" class="remove-button">
                ×
              </button>
            </div>
            <div class="add-site">
              <input 
                v-model="newDisabledSite"
                placeholder="添加网站域名..."
                @keyup.enter="addSite('disabled')"
                class="site-input"
              >
              <button @click="addSite('disabled')" class="add-button">
                添加
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>关于</h2>
        <div class="about-info">
          <p><strong>版本:</strong> 1.0.0</p>
          <p><strong>作者:</strong> PiP Extension Team</p>
          <p><strong>描述:</strong> 为所有视频平台提供增强的画中画功能</p>
        </div>
      </div>
    </main>

    <div v-if="showSaveNotification" class="save-notification">
      设置已保存
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ExtensionSettings } from '~/utils/types'
import { chrome } from 'vue-chrome-extension'

const settings = ref<ExtensionSettings>({
  enabledSites: ['youtube.com', 'bilibili.com', 'netflix.com'],
  disabledSites: [],
  shortcutKey: 'Alt+P',
  autoActivate: false,
  showNotifications: true
})

const newEnabledSite = ref('')
const newDisabledSite = ref('')
const showSaveNotification = ref(false)

const loadSettings = async () => {
  try {
    const stored = await chrome.storage.sync.get('settings')
    if (stored.settings) {
      settings.value = { ...settings.value, ...stored.settings }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const saveSettings = async () => {
  try {
    await chrome.storage.sync.set({ settings: settings.value })
    showSaveNotification.value = true
    setTimeout(() => {
      showSaveNotification.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

const addSite = (type: 'enabled' | 'disabled') => {
  const newSite = type === 'enabled' ? newEnabledSite.value : newDisabledSite.value
  
  if (!newSite.trim()) return
  
  const cleanSite = newSite.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
  
  if (type === 'enabled') {
    if (!settings.value.enabledSites.includes(cleanSite)) {
      settings.value.enabledSites.push(cleanSite)
      newEnabledSite.value = ''
    }
  } else {
    if (!settings.value.disabledSites.includes(cleanSite)) {
      settings.value.disabledSites.push(cleanSite)
      newDisabledSite.value = ''
    }
  }
  
  saveSettings()
}

const removeSite = (site: string, type: 'enabled' | 'disabled') => {
  if (type === 'enabled') {
    const index = settings.value.enabledSites.indexOf(site)
    if (index > -1) {
      settings.value.enabledSites.splice(index, 1)
    }
  } else {
    const index = settings.value.disabledSites.indexOf(site)
    if (index > -1) {
      settings.value.disabledSites.splice(index, 1)
    }
  }
  
  saveSettings()
}

const changeShortcut = () => {
  // 这里可以实现快捷键修改功能
  alert('快捷键修改功能将在后续版本中实现')
}

onMounted(() => {
  loadSettings()
})
</script>

<style>
.options-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.header p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.main {
  padding: 40px;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 8px;
}

.setting-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.setting-label input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.setting-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.setting-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.shortcut-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.shortcut-display kbd {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  font-family: monospace;
  font-size: 14px;
}

.change-button {
  padding: 6px 12px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.change-button:hover {
  background: #667eea;
  color: white;
}

.site-list {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
}

.site-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.site-item:last-child {
  border-bottom: none;
}

.site-item.enabled {
  background: #f0f9ff;
  border-left: 4px solid #22c55e;
}

.site-item.disabled {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}

.remove-button {
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background 0.2s;
}

.remove-button:hover {
  background: #dc2626;
}

.add-site {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #f9f9f9;
}

.site-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.site-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-button {
  padding: 8px 16px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.add-button:hover {
  background: #5a67d8;
}

.about-info {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.about-info p {
  margin: 8px 0;
  color: #666;
}

.save-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #22c55e;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
