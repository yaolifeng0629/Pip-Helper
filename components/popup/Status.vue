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
    <!-- 主按钮 -->
    <button class="pip-btn-main" @click="onActivatePip">
      <svg class="pip-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="11" y="11" width="7" height="5" rx="1" fill="currentColor"/>
      </svg>
      一键画中画
    </button>

    <!-- 多视频选择按钮 -->
    <button v-if="videoCount > 1" class="pip-btn-select" @click="onShowVideoPicker">
      <svg class="pip-btn-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636l4.95 4.95z" fill="currentColor" />
      </svg>
      选择视频 ({{ videoCount }})
    </button>

    <!-- 状态信息 -->
    <div class="pip-status-text" v-if="status">{{ status }}</div>

    <!-- 快捷键提示 -->
    <div class="pip-shortcut-tip">
      快捷键: <kbd>Alt+P</kbd> | 返回原标签页: <kbd>Alt+B</kbd>
    </div>
  </div>
</template>

<style scoped>
.pip-status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px 0;
}

.pip-btn-main {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  padding: 14px 32px;
  font-size: 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #42b883 0%, #347474 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}

.pip-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

.pip-btn-main:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(66, 184, 131, 0.3);
}

.pip-btn-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.pip-btn-select {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  border: none;
  background: #f0f0f0;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pip-btn-select:hover {
  background: #e0e0e0;
}

.pip-btn-icon-small {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.pip-status-text {
  margin-top: 16px;
  color: #555;
  font-size: 14px;
  background: #f5f5f5;
  padding: 8px 16px;
  border-radius: 8px;
  border-left: 3px solid #42b883;
}

.pip-shortcut-tip {
  margin-top: 16px;
  font-size: 12px;
  color: #888;
  background: rgba(66, 184, 131, 0.08);
  padding: 6px 12px;
  border-radius: 6px;
}

kbd {
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  color: #333;
  display: inline-block;
  font-size: 11px;
  line-height: 1.4;
  margin: 0 0.1em;
  padding: 0.1em 0.6em;
  text-shadow: 0 1px 0 #fff;
}
</style>
