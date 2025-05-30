<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const status = ref('');
const showSettings = ref(false);
const whitelist = ref<string[]>([]);
const blacklist = ref<string[]>([]);
const newDomain = ref('');
const isWhitelistMode = ref(true);
const customShortcut = ref('Alt+P');

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

onMounted(async () => {
  // 读取设置
  const data = await browser.storage.local.get(['pip_whitelist', 'pip_blacklist', 'pip_shortcut']);
  whitelist.value = data.pip_whitelist || [];
  blacklist.value = data.pip_blacklist || [];
  customShortcut.value = data.pip_shortcut || 'Alt+P';

  // 检查当前页面是否有可用视频
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  // 发送探测消息
  await browser.tabs.sendMessage(tab.id, { type: 'probe-video' });
  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'probe-result') {
      status.value = msg.hasVideo ? '检测到可用视频' : '未检测到视频';
    }
    if (msg?.type === 'show-toast') {
      status.value = msg.reason;
    }
  });
});

function saveList() {
  browser.storage.local.set({ pip_whitelist: whitelist.value, pip_blacklist: blacklist.value });
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
  browser.storage.local.set({ pip_shortcut: customShortcut.value });
}

function activatePiP() {
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
  });
}
</script>

<template>
  <div style="text-align:center">
    <button @click="activatePiP">一键画中画</button>
    <button style="margin-left:10px;font-size:13px;" @click="showSettings = !showSettings">设置</button>
    <div style="margin-top:10px;color:#888;font-size:13px;min-height:1.5em">{{ status }}</div>
    <div v-if="showSettings" style="margin-top:18px;text-align:left;background:#f8f8f8;padding:12px 16px;border-radius:8px;">
      <div style="margin-bottom:8px;font-weight:bold;">网站黑/白名单</div>
      <label><input type="radio" v-model="isWhitelistMode" :value="true"> 白名单</label>
      <label style="margin-left:16px;"><input type="radio" v-model="isWhitelistMode" :value="false"> 黑名单</label>
      <div style="margin:8px 0;">
        <input v-model="newDomain" placeholder="输入域名，如: bilibili.com" style="width:60%" />
        <button @click="addDomain" style="margin-left:8px;">添加</button>
      </div>
      <div v-if="isWhitelistMode">
        <div v-for="d in whitelist" :key="d" style="display:flex;align-items:center;gap:8px;">
          <span>{{ d }}</span>
          <button @click="removeDomain(d)" style="font-size:12px;">移除</button>
        </div>
      </div>
      <div v-else>
        <div v-for="d in blacklist" :key="d" style="display:flex;align-items:center;gap:8px;">
          <span>{{ d }}</span>
          <button @click="removeDomain(d)" style="font-size:12px;">移除</button>
        </div>
      </div>
      <div style="margin-top:16px;font-weight:bold;">自定义快捷键（需在扩展管理页设置）</div>
      <input v-model="customShortcut" @change="saveShortcut" style="width:120px;" />
      <div style="font-size:12px;color:#888;">实际生效以浏览器扩展快捷键设置为准</div>
    </div>
  </div>
</template>

<style scoped>
button {
  padding: 8px 18px;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  background: #42b883;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #368e6c;
}
</style>
