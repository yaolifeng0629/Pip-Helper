<!-- 设置组件 - 管理黑白名单和快捷键设置 -->
<script setup lang="ts">
import { ref } from 'vue';
import { UserSettings } from '../../utils/storage';

// 组件属性
interface Props {
  settings: UserSettings;
  onSave: (settings: Partial<UserSettings>) => void;
}

const props = defineProps<Props>();

// 组件状态
const whitelist = ref<string[]>(props.settings.whitelist);
const blacklist = ref<string[]>(props.settings.blacklist);
const shortcut = ref<string>(props.settings.shortcut);
const newDomain = ref('');
const isWhitelistMode = ref(true);

// 添加域名到黑/白名单
function addDomain() {
  if (!newDomain.value) return;

  if (isWhitelistMode.value) {
    if (!whitelist.value.includes(newDomain.value)) {
      whitelist.value = [...whitelist.value, newDomain.value];
      props.onSave({ whitelist: whitelist.value });
    }
  } else {
    if (!blacklist.value.includes(newDomain.value)) {
      blacklist.value = [...blacklist.value, newDomain.value];
      props.onSave({ blacklist: blacklist.value });
    }
  }

  newDomain.value = '';
}

// 从黑/白名单中移除域名
function removeDomain(domain: string) {
  if (isWhitelistMode.value) {
    whitelist.value = whitelist.value.filter(d => d !== domain);
    props.onSave({ whitelist: whitelist.value });
  } else {
    blacklist.value = blacklist.value.filter(d => d !== domain);
    props.onSave({ blacklist: blacklist.value });
  }
}

// 保存快捷键设置
function saveShortcut() {
  props.onSave({ shortcut: shortcut.value });
}
</script>

<template>
  <div class="pip-settings">
    <div class="pip-settings-section">
      <div class="pip-settings-title">
        <svg class="pip-settings-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" />
        </svg>
        网站黑/白名单
      </div>
      <div class="pip-radio-group">
        <label class="pip-radio-label">
          <input type="radio" v-model="isWhitelistMode" :value="true" class="pip-radio" />
          <span class="pip-radio-text">白名单</span>
        </label>
        <label class="pip-radio-label">
          <input type="radio" v-model="isWhitelistMode" :value="false" class="pip-radio" />
          <span class="pip-radio-text">黑名单</span>
        </label>
      </div>

      <div class="pip-domain-add">
        <input
          v-model="newDomain"
          placeholder="输入域名，如: bilibili.com"
          class="pip-input"
          @keyup.enter="addDomain"
        />
        <button @click="addDomain" class="pip-btn">添加</button>
      </div>

      <div class="pip-domain-list" v-if="isWhitelistMode">
        <div v-for="domain in whitelist" :key="domain" class="pip-domain-item">
          <span class="pip-domain-text">{{ domain }}</span>
          <button @click="removeDomain(domain)" class="pip-btn-remove">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div v-if="whitelist.length === 0" class="pip-empty-list">
          白名单为空，所有网站均可使用画中画
        </div>
      </div>

      <div class="pip-domain-list" v-else>
        <div v-for="domain in blacklist" :key="domain" class="pip-domain-item">
          <span class="pip-domain-text">{{ domain }}</span>
          <button @click="removeDomain(domain)" class="pip-btn-remove">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div v-if="blacklist.length === 0" class="pip-empty-list">
          黑名单为空，所有网站均可使用画中画
        </div>
      </div>
    </div>

    <div class="pip-settings-section">
      <div class="pip-settings-title">
        <svg class="pip-settings-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 14v4h-2v-4h-4v-2h4V8h2v4h4v2h-4zm-7-2v2H8v4H6v-4H2v-2h4V8h2v4h4z" fill="currentColor"/>
        </svg>
        快捷键设置
      </div>
      <div class="pip-shortcut-container">
        <input
          v-model="shortcut"
          @change="saveShortcut"
          class="pip-input pip-shortcut-input"
        />
        <div class="pip-tip">实际生效以浏览器扩展快捷键设置为准</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pip-settings {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  margin-top: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.pip-settings-section {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.pip-settings-section:last-child {
  border-bottom: none;
}

.pip-settings-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  font-size: 16px;
}

.pip-settings-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #42b883;
}

.pip-radio-group {
  display: flex;
  margin-bottom: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.pip-radio-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
  position: relative;
  border-radius: 6px;
  transition: all 0.2s;
}

.pip-radio-label:has(.pip-radio:checked) {
  background: #42b883;
  color: white;
}

.pip-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.pip-radio-text {
  font-size: 14px;
  font-weight: 500;
}

.pip-domain-add {
  display: flex;
  margin-bottom: 16px;
}

.pip-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: #f9f9f9;
}

.pip-input:focus {
  outline: none;
  border-color: #42b883;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.pip-btn {
  margin-left: 8px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: #42b883;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pip-btn:hover {
  background: #3aa876;
  transform: translateY(-1px);
}

.pip-btn:active {
  transform: translateY(1px);
}

.pip-domain-list {
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
  background: #f9f9f9;
  padding: 4px;
}

.pip-domain-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: #fff;
  border-radius: 6px;
  transition: all 0.2s;
}

.pip-domain-item:hover {
  background: #f0f0f0;
}

.pip-domain-text {
  font-size: 14px;
  color: #333;
}

.pip-btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pip-btn-remove:hover {
  background: #ffeeee;
}

.pip-shortcut-container {
  display: flex;
  flex-direction: column;
}

.pip-shortcut-input {
  width: 120px;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.pip-tip {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

.pip-empty-list {
  color: #888;
  font-style: italic;
  padding: 12px;
  text-align: center;
  font-size: 14px;
}
</style>
