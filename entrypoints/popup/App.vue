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
        ? `检测到 ${msg.count || 0} 个可用视频`
        : '未检测到视频';

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
    status.value = '当前网站已被禁用';
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
    status.value = '当前网站已被禁用';
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

    <div class="pip-main">
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
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background: #f6f8fa;
  color: #333;
}

/* 组件样式 */
.pip-popup {
  min-width: 340px;
  max-width: 380px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  margin: 0;
}

.pip-main {
  padding: 20px 24px 24px;
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
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #42b883;
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
