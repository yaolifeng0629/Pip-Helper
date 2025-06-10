<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getUserSettings, saveUserSettings, isUrlAllowed, UserSettings } from '../../utils/storage';
import Header from '../../components/popup/Header.vue';
import Status from '../../components/popup/Status.vue';
import Settings from '../../components/popup/Settings.vue';

// 状态变量
const status = ref('');
const showSettings = ref(false);
const videoCount = ref(0);
const settings = ref<UserSettings>({
  whitelist: [],
  blacklist: [],
  shortcut: 'Alt+P'
});

// 初始化，读取设置
onMounted(async () => {
  // 加载用户设置
  const userSettings = await getUserSettings();
  settings.value = userSettings;

  // 检查当前页面是否有可用视频
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // 发送探测消息
  await browser.tabs.sendMessage(tab.id, { type: 'probe-video' });

  // 监听消息
  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'probe-result') {
      status.value = msg.hasVideo
        ? `Detected ${msg.count || 0} available videos`
        : 'No videos detected';

      // 更新视频数量
      videoCount.value = msg.count || 0;
    }
    if (msg?.type === 'show-toast') {
      status.value = msg.reason;
    }
  });
});

// 切换设置面板显示
function toggleSettings() {
  showSettings.value = !showSettings.value;
}

// 保存设置
function handleSaveSettings(newSettings: Partial<UserSettings>) {
  saveUserSettings(newSettings);

  // 更新本地状态
  if (newSettings.whitelist !== undefined) {
    settings.value.whitelist = newSettings.whitelist;
  }
  if (newSettings.blacklist !== undefined) {
    settings.value.blacklist = newSettings.blacklist;
  }
  if (newSettings.shortcut !== undefined) {
    settings.value.shortcut = newSettings.shortcut;
  }
}

// 激活画中画
async function activatePiP() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // 检查当前网站是否在黑白名单中
  const allowed = await isUrlAllowed(tab.url || '');
  if (!allowed) {
    status.value = 'PiP is disabled for this website';
    return;
  }

  // 发送激活画中画消息
  await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
}

// 显示视频选择器
async function showVideoPicker() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // 检查当前网站是否在黑白名单中
  const allowed = await isUrlAllowed(tab.url || '');
  if (!allowed) {
    status.value = 'This website is disabled';
    return;
  }

  // 发送显示视频选择器消息
  await browser.tabs.sendMessage(tab.id, { type: 'show-video-picker' });

  // 关闭弹出窗口
  window.close();
}
</script>

<template>
  <div class="pip-popup">
    <!-- 头部 -->
    <Header :onToggleSettings="toggleSettings" />

    <div class="pip-main" :class="{ 'pip-main-settings': showSettings }">
      <!-- 状态和主操作按钮 -->
      <Status
        :status="status"
        :videoCount="videoCount"
        :onActivatePip="activatePiP"
        :onShowVideoPicker="showVideoPicker"
      />

      <!-- 设置面板 -->
      <transition name="fade">
        <Settings
          v-if="showSettings"
          :settings="settings"
          :onSave="handleSaveSettings"
        />
      </transition>
    </div>
  </div>
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: #F9FAFB;
  color: #1F2937;
}

/* 组件样式 */
.pip-popup {
  min-width: 380px;
  max-width: 380px;
  background: #F9FAFB;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
}

.pip-main {
  padding: 0;
  transition: all 0.3s ease;
}

.pip-main-settings {
  background: #F3F4F6;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* 按钮点击效果 */
button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform .5s, opacity 1s;
}

button:active::after {
  transform: scale(0, 0);
  opacity: .3;
  transition: 0s;
}
</style>
