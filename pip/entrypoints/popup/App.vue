<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getDomain, getUserSettings, saveUserSettings, fetchQuota } from './utils';

// 状态变量
const status = ref('');
const showSettings = ref(false);
const whitelist = ref<string[]>([]);
const blacklist = ref<string[]>([]);
const newDomain = ref('');
const isWhitelistMode = ref(true);
const customShortcut = ref('Alt+P');
const user = ref<{ avatar?: string; name?: string; provider?: string } | null>(null);
const showLoginMenu = ref(false);
const quota = ref<number | null>(null);

// 初始化，读取设置和额度
onMounted(async () => {
  const data = await getUserSettings();
  whitelist.value = data.pip_whitelist || [];
  blacklist.value = data.pip_blacklist || [];
  customShortcut.value = data.pip_shortcut || 'Alt+P';

  // 检查当前页面是否有可用视频
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await browser.tabs.sendMessage(tab.id, { type: 'probe-video' });
  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'probe-result') {
      status.value = msg.hasVideo ? '检测到可用视频' : '未检测到视频';
    }
    if (msg?.type === 'show-toast') {
      status.value = msg.reason;
    }
  });
  quota.value = await fetchQuota();
});

// 保存设置
function saveList() {
  saveUserSettings({ whitelist: whitelist.value, blacklist: blacklist.value });
}
function addDomain() {
  if (!newDomain.value) return;
  if (isWhitelistMode.value) {
    if (!whitelist.value.includes(newDomain.value)) whitelist.value.push(newDomain.value);
  } else {
    if (!blacklist.value.includes(newDomain.value)) blacklist.value.push(newDomain.value);
  }
  newDomain.value = '';
  saveList();
}
function removeDomain(domain: string) {
  if (isWhitelistMode.value) {
    whitelist.value = whitelist.value.filter(d => d !== domain);
  } else {
    blacklist.value = blacklist.value.filter(d => d !== domain);
  }
  saveList();
}
function saveShortcut() {
  saveUserSettings({ shortcut: customShortcut.value });
}

// 一键画中画，含额度和黑白名单判断
function activatePiP() {
  if (quota.value !== null && quota.value <= 0) {
    status.value = '您的画中画额度已用完，请充值或联系客服';
    return;
  }
  browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (!tab?.id) return;
    const domain = getDomain(tab.url || '');
    if (
      (whitelist.value.length && !whitelist.value.includes(domain)) ||
      (blacklist.value.length && blacklist.value.includes(domain))
    ) {
      status.value = '当前网站已被禁用';
      return;
    }
    browser.tabs.sendMessage(tab.id, 'activate-pip');
    if (quota.value !== null) quota.value!--;
  });
}

// 用户登录相关
function onAvatarClick() {
  showLoginMenu.value = !showLoginMenu.value;
}
async function login(provider: 'google' | 'github') {
  // 模拟登录逻辑，实际应跳转 OAuth
  user.value = {
    avatar: provider === 'google' ? 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f600.png' : 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f47b.png',
    name: provider === 'google' ? 'Google用户' : 'Github用户',
    provider,
  };
  showLoginMenu.value = false;
}
</script>

<template>
  <div class="pip-popup">
    <div class="pip-header">
      <div class="pip-title">画中画助手</div>
      <div class="pip-user" @click="onAvatarClick">
        <img v-if="user?.avatar" :src="user.avatar" class="pip-avatar" alt="头像" />
        <div v-else class="pip-avatar pip-avatar-default"></div>
        <transition name="fade">
          <div v-if="showLoginMenu" class="pip-login-menu">
            <div class="pip-login-title">{{ user?.name || '未登录' }}</div>
            <button class="pip-login-btn" @click="login('google')">
              <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f600.png" class="pip-login-icon" /> Google 登录
            </button>
            <button class="pip-login-btn" @click="login('github')">
              <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f47b.png" class="pip-login-icon" /> Github 登录
            </button>
          </div>
        </transition>
      </div>
    </div>
    <div class="pip-main">
      <button class="pip-btn-main" @click="activatePiP">一键画中画</button>
      <button class="pip-btn-secondary" @click="showSettings = !showSettings">设置</button>
      <div class="pip-status">{{ status }}</div>
      <div v-if="quota !== null" class="pip-quota">剩余额度：{{ quota }} 次</div>
      <transition name="fade">
        <div v-if="showSettings" class="pip-settings">
          <div class="pip-settings-title">网站黑/白名单</div>
          <div class="pip-radio-group">
            <label><input type="radio" v-model="isWhitelistMode" :value="true" /> 白名单</label>
            <label><input type="radio" v-model="isWhitelistMode" :value="false" style="margin-left:16px;" /> 黑名单</label>
          </div>
          <div class="pip-domain-add">
            <input v-model="newDomain" placeholder="输入域名，如: bilibili.com" />
            <button @click="addDomain">添加</button>
          </div>
          <div v-if="isWhitelistMode">
            <div v-for="d in whitelist" :key="d" class="pip-domain-item">
              <span>{{ d }}</span>
              <button @click="removeDomain(d)">移除</button>
            </div>
          </div>
          <div v-else>
            <div v-for="d in blacklist" :key="d" class="pip-domain-item">
              <span>{{ d }}</span>
              <button @click="removeDomain(d)">移除</button>
            </div>
          </div>
          <div class="pip-settings-title" style="margin-top:16px;">自定义快捷键（需在扩展管理页设置）</div>
          <input v-model="customShortcut" @change="saveShortcut" class="pip-shortcut-input" />
          <div class="pip-tip">实际生效以浏览器扩展快捷键设置为准</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.pip-popup {
  min-width: 340px;
  background: #f6f8fa;
  border-radius: 14px;
  box-shadow: 0 4px 32px #0001;
  padding: 0 0 18px 0;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.pip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 0 20px;
}
.pip-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
}
.pip-user {
  position: relative;
  cursor: pointer;
}
.pip-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #eee;
  border: 2px solid #e0e0e0;
  object-fit: cover;
  transition: box-shadow 0.2s;
}
.pip-avatar-default {
  display: inline-block;
}
.pip-avatar:hover {
  box-shadow: 0 2px 8px #42b88355;
}
.pip-login-menu {
  position: absolute;
  right: 0;
  top: 48px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 12px #0002;
  padding: 14px 18px 10px 18px;
  min-width: 160px;
  z-index: 10;
}
.pip-login-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
.pip-login-btn {
  width: 100%;
  background: #f6f8fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 7px 0 7px 8px;
  margin-bottom: 8px;
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.pip-login-btn:hover {
  background: #e6f7f1;
}
.pip-login-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
.pip-main {
  padding: 0 24px;
  text-align: center;
}
.pip-btn-main {
  margin-top: 18px;
  padding: 10px 32px;
  font-size: 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #42b883 60%, #368e6c 100%);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px #42b88322;
  transition: background 0.2s;
}
.pip-btn-main:hover {
  background: linear-gradient(90deg, #368e6c 60%, #42b883 100%);
}
.pip-btn-secondary {
  margin-left: 16px;
  margin-top: 18px;
  padding: 8px 18px;
  font-size: 15px;
  border-radius: 8px;
  border: none;
  background: #e0e0e0;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}
.pip-btn-secondary:hover {
  background: #d0f5e8;
}
.pip-status {
  margin-top: 14px;
  color: #888;
  font-size: 14px;
  min-height: 1.5em;
}
.pip-quota {
  margin-top: 4px;
  color: #42b883;
  font-size: 13px;
}
.pip-settings {
  margin-top: 18px;
  background: #fff;
  padding: 16px 18px 10px 18px;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  text-align: left;
}
.pip-settings-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}
.pip-radio-group {
  margin-bottom: 10px;
}
.pip-domain-add {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.pip-domain-add input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 15px;
}
.pip-domain-add button {
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  background: #42b883;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}
.pip-domain-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.pip-domain-item button {
  padding: 2px 10px;
  border-radius: 5px;
  border: none;
  background: #e0e0e0;
  color: #333;
  font-size: 13px;
  cursor: pointer;
}
.pip-domain-item button:hover {
  background: #f6f8fa;
}
.pip-shortcut-input {
  width: 120px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 15px;
  margin-top: 4px;
}
.pip-tip {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
