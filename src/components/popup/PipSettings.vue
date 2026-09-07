<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { i18n, type Language } from '../../utils/i18n';
import { normalizeDomain, type UserSettings } from '../../utils/storage';

const props = defineProps<{
  settings: UserSettings;
  onSave: (settings: Partial<UserSettings>) => void;
}>();

const newDomain = ref('');
const selectedLanguage = ref<Language>(i18n.currentLanguage.value);
const localSettings = ref<UserSettings>({ ...props.settings });

watch(() => props.settings, value => {
  localSettings.value = {
    ...value,
    allowedSites: [...value.allowedSites],
    blockedSites: [...value.blockedSites],
  };
}, { deep: true });

const exceptionSites = computed(() => localSettings.value.siteAccessMode === 'allow-by-default'
  ? localSettings.value.blockedSites
  : localSettings.value.allowedSites);

function saveSettings(changes: Partial<UserSettings>): void {
  localSettings.value = { ...localSettings.value, ...changes };
  props.onSave(changes);
}

function setMode(mode: UserSettings['siteAccessMode']): void {
  saveSettings({ siteAccessMode: mode });
}

function addException(): void {
  const domain = normalizeDomain(newDomain.value);
  if (!domain || exceptionSites.value.includes(domain)) return;

  if (localSettings.value.siteAccessMode === 'allow-by-default') {
    saveSettings({ blockedSites: [...localSettings.value.blockedSites, domain] });
  } else {
    saveSettings({ allowedSites: [...localSettings.value.allowedSites, domain] });
  }
  newDomain.value = '';
}

function removeException(domain: string): void {
  if (localSettings.value.siteAccessMode === 'allow-by-default') {
    saveSettings({ blockedSites: localSettings.value.blockedSites.filter(site => site !== domain) });
  } else {
    saveSettings({ allowedSites: localSettings.value.allowedSites.filter(site => site !== domain) });
  }
}

function changeLanguage(language: Language): void {
  selectedLanguage.value = language;
  i18n.setLanguage(language);
}
</script>

<template>
  <section class="settings-panel">
    <div class="setting-group">
      <label class="setting-label" for="language">{{ i18n.t('settings.language') }}</label>
      <select id="language" v-model="selectedLanguage" class="select-control" @change="changeLanguage(selectedLanguage)">
        <option value="zh-CN">简体中文</option>
        <option value="zh-TW">繁體中文</option>
        <option value="en">English</option>
      </select>
    </div>

    <div class="setting-group">
      <span class="setting-label">{{ i18n.t('settings.siteAccess') }}</span>
      <label class="mode-option">
        <input
          type="radio"
          name="site-access-mode"
          :checked="localSettings.siteAccessMode === 'allow-by-default'"
          @change="setMode('allow-by-default')"
        />
        <span>{{ i18n.t('settings.allowByDefault') }}</span>
      </label>
      <label class="mode-option">
        <input
          type="radio"
          name="site-access-mode"
          :checked="localSettings.siteAccessMode === 'block-by-default'"
          @change="setMode('block-by-default')"
        />
        <span>{{ i18n.t('settings.blockByDefault') }}</span>
      </label>
    </div>

    <div class="setting-group">
      <span class="setting-label">{{ i18n.t('settings.exceptions') }}</span>
      <div class="domain-entry">
        <input
          v-model="newDomain"
          type="text"
          :placeholder="i18n.t('settings.domainPlaceholder')"
          @keyup.enter="addException"
        />
        <button type="button" @click="addException">{{ i18n.t('settings.add') }}</button>
      </div>
      <div v-if="exceptionSites.length" class="domain-list">
        <div v-for="domain in exceptionSites" :key="domain" class="domain-item">
          <span>{{ domain }}</span>
          <button type="button" :aria-label="`Remove ${domain}`" @click="removeException(domain)">&times;</button>
        </div>
      </div>
      <p v-else class="empty-state">{{ i18n.t('settings.noExceptions') }}</p>
    </div>
  </section>
</template>

<style scoped>
.settings-panel { display: grid; gap: 18px; padding: 2px 22px 22px; }
.setting-group { display: grid; gap: 9px; }
.setting-label { color: #343430; font-size: 12px; font-weight: 700; }
.select-control,
.domain-entry input { min-height: 38px; border: 1px solid #deded9; border-radius: 8px; background: #fff; color: #373733; padding: 0 10px; font-size: 12px; }
.mode-option { display: flex; align-items: flex-start; gap: 8px; color: #5d5d58; font-size: 12px; line-height: 1.45; cursor: pointer; }
.mode-option input { margin: 2px 0 0; accent-color: #222220; }
.domain-entry { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
.domain-entry input { min-width: 0; }
.domain-entry button { min-width: 54px; border: 1px solid #272725; border-radius: 8px; background: #272725; color: #fff; cursor: pointer; font-size: 12px; font-weight: 650; }
.domain-list { display: grid; gap: 6px; max-height: 160px; overflow: auto; }
.domain-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; border-radius: 8px; background: #f8f8f6; color: #4f4f4a; font-size: 12px; }
.domain-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.domain-item button { width: 24px; height: 24px; border: 0; border-radius: 6px; background: transparent; color: #5f5f59; cursor: pointer; font-size: 18px; line-height: 1; }
.domain-item button:hover { background: #ecece8; color: #1d1d1a; }
.empty-state { margin: 0; color: #82827c; font-size: 12px; }
</style>
