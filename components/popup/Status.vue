<!-- 状态组件 - 显示当前页面视频状态和操作按钮 -->
<script setup lang="ts">
import { ref } from 'vue';

// 组件属性
interface Props {
  status: string;
  videoCount: number;
  onActivatePip: () => void;
  onShowVideoPicker: () => void;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="pip-status-container">
    <!-- 状态信息 -->
    <div class="pip-status-text" v-if="status">
      <div class="pip-status-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      {{ status }}
    </div>

    <!-- 主按钮 -->
    <button class="pip-btn-main" @click="onActivatePip">
      <div class="pip-btn-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
          <rect x="12" y="12" width="6" height="4" rx="1" fill="currentColor"/>
        </svg>
      </div>
      一键画中画
    </button>

    <!-- 多视频选择按钮 -->
    <button v-if="videoCount > 1" class="pip-btn-select" @click="onShowVideoPicker">
      <div class="pip-btn-icon-small">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
          <rect x="10" y="10" width="8" height="6" rx="1" fill="currentColor"/>
        </svg>
      </div>
      选择视频 ({{ videoCount }})
    </button>

    <!-- 快捷键提示 -->
    <div class="pip-shortcut-tip">
      <div class="pip-shortcut-item">
        <kbd>Alt+P</kbd>
        <span>激活画中画</span>
      </div>
      <div class="pip-shortcut-item">
        <kbd>Alt+B</kbd>
        <span>返回原标签页</span>
      </div>
      <div class="pip-shortcut-item" v-if="videoCount > 1">
        <kbd>←</kbd><kbd>→</kbd>
        <span>切换视频</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pip-status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px 0;
  padding: 0 16px;
}

.pip-status-text {
  width: 100%;
  margin-bottom: 16px;
  color: #4B5563;
  font-size: 14px;
  background: #F3F4F6;
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.pip-status-icon {
  margin-right: 8px;
  color: #3B82F6;
  display: flex;
  align-items: center;
}

.pip-btn-main {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px 32px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  background: #3B82F6;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.pip-btn-main:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.pip-btn-main:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.pip-btn-icon {
  width: 22px;
  height: 22px;
  margin-right: 8px;
  color: white;
}

.pip-btn-select {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 12px;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  color: #4B5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pip-btn-select:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.pip-btn-icon-small {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  color: #4B5563;
}

.pip-shortcut-tip {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.pip-shortcut-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6B7280;
}

.pip-shortcut-item:last-child {
  margin-bottom: 0;
}

.pip-shortcut-item span {
  margin-left: 8px;
}

kbd {
  background-color: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  color: #4F46E5;
  display: inline-block;
  font-size: 11px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  line-height: 1.4;
  margin: 0 2px;
  min-width: 20px;
  padding: 0.1em 0.5em;
  text-align: center;
}
</style>
