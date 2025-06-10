<!-- 头部组件 - 显示标题和设置按钮 -->
<script setup lang="ts">
import { ref } from 'vue';

// 组件属性
interface Props {
  onToggleSettings: () => void;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="pip-header">
    <div class="pip-title">
      <div class="pip-logo-container">
        <svg class="pip-logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
          <rect x="12" y="12" width="6" height="4" rx="1" fill="currentColor"/>
        </svg>
      </div>
      <span class="pip-title-text">PiP Assistant</span>
    </div>
    <button class="pip-settings-btn" @click="onToggleSettings">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.pip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #3B82F6;
  border-radius: 0;
  color: white;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.2);
}

.pip-title {
  display: flex;
  align-items: center;
}

.pip-title-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.pip-logo-container {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pip-logo-svg {
  width: 24px;
  height: 24px;
  color: white;
}

.pip-settings-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pip-settings-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: rotate(15deg);
}

.pip-settings-btn:active {
  transform: scale(0.95);
}
</style>
