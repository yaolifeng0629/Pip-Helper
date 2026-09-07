<script setup lang="ts">
import { i18n } from '../../utils/i18n';

defineProps<{
  settingsOpen: boolean;
  onToggleSettings: () => void;
}>();
</script>

<template>
  <header class="minimal-header">
    <span aria-hidden="true"></span>
    <div class="minimal-brand">
      <span class="pip-mark" aria-hidden="true"></span>
      <span>Pip-Helper</span>
    </div>
    <button
      type="button"
      class="settings-button"
      :aria-expanded="settingsOpen"
      @click="onToggleSettings"
    >
      {{ i18n.t('popup.settings') }}
    </button>
  </header>
</template>

<style scoped>
.minimal-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 58px;
  padding: 0 18px;
  border-bottom: 1px solid #ecece8;
}

.minimal-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1c1c1a;
  font-size: 15px;
  font-weight: 700;
}

.pip-mark {
  position: relative;
  width: 18px;
  height: 14px;
  border: 1.8px solid currentColor;
  border-radius: 3px;
}

.pip-mark::after {
  content: '';
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 5px;
  height: 4px;
  border: 1.5px solid currentColor;
  border-radius: 1px;
}

.settings-button {
  justify-self: end;
  border: 0;
  background: transparent;
  color: #62625d;
  cursor: pointer;
  font-size: 12px;
  padding: 7px 0 7px 10px;
}

.settings-button:hover,
.settings-button:focus-visible {
  color: #1c1c1a;
  text-decoration: underline;
}
</style>
