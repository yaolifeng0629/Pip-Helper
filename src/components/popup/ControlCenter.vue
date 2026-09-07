<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getUserSettings, saveUserSettings, type UserSettings } from '../../utils/storage';
import { i18n } from '../../utils/i18n';
import type { PipRequest, PipResponse, PipState, PipStateChangedMessage } from '../../utils/pipMessages';
import MinimalHeader from './MinimalHeader.vue';
import PipSettings from './PipSettings.vue';
import PipStatus from './PipStatus.vue';

const settings = ref<UserSettings>({
  siteAccessMode: 'allow-by-default',
  allowedSites: [],
  blockedSites: [],
  shortcut: 'Alt+P',
  whitelist: [],
  blacklist: [],
});
const state = ref<PipState | null>(null);
const currentTabId = ref<number | null>(null);
const showSettings = ref(false);
const busy = ref(false);
const notice = ref('');

function setUnavailableState(): void {
  state.value = {
    status: 'unavailable',
    candidateCount: 0,
    candidates: [],
    currentSite: '',
    siteAllowed: false,
  };
}

async function getActiveTabId(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId.value = tab?.id ?? null;
  return currentTabId.value;
}

async function refreshState(): Promise<void> {
  const tabId = await getActiveTabId();
  if (!tabId) {
    setUnavailableState();
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'pip:get-state' } satisfies PipRequest) as PipResponse;
    state.value = response.state;
    notice.value = '';
  } catch {
    setUnavailableState();
  }
}

async function sendCommand(request: PipRequest, closeAfter = false): Promise<void> {
  if (busy.value) return;
  const tabId = currentTabId.value ?? await getActiveTabId();
  if (!tabId) {
    setUnavailableState();
    return;
  }

  busy.value = true;
  try {
    const response = await chrome.tabs.sendMessage(tabId, request) as PipResponse;
    state.value = response.state;
    notice.value = response.error ? errorText(response.error) : '';
    if (closeAfter && response.ok) window.close();
  } catch {
    setUnavailableState();
  } finally {
    busy.value = false;
  }
}

function errorText(error: NonNullable<PipResponse['error']>): string {
  if (error === 'not-allowed') return i18n.t('status.notAllowed');
  if (error === 'no-video') return i18n.t('status.noVideo');
  if (error === 'blocked') return i18n.t('status.blocked');
  return i18n.t('status.unsupported');
}

function togglePip(): void {
  void sendCommand({ type: 'pip:toggle' });
}

function chooseVideo(): void {
  void sendCommand({ type: 'pip:choose-video' }, true);
}

function selectVideo(candidateId: string): void {
  void sendCommand({ type: 'pip:select-video', candidateId });
}

function toggleSiteRule(): void {
  void sendCommand({ type: 'pip:toggle-site-rule' });
}

function saveSettings(changes: Partial<UserSettings>): void {
  const next = {
    ...settings.value,
    ...changes,
  };
  next.whitelist = next.allowedSites;
  next.blacklist = next.blockedSites;
  settings.value = next;

  void saveUserSettings(changes).then(refreshState);
}

function handleStateChanged(message: unknown, sender: { tab?: { id?: number } }): void {
  const stateMessage = message as Partial<PipStateChangedMessage>;
  if (stateMessage.type !== 'pip:state-changed' || !stateMessage.state) return;
  if (sender.tab?.id !== currentTabId.value) return;
  state.value = stateMessage.state;
}

onMounted(async () => {
  await i18n.loadSavedLanguage();
  i18n.setupLanguageSync();
  settings.value = await getUserSettings();
  await refreshState();
  chrome.runtime.onMessage.addListener(handleStateChanged);
});

onUnmounted(() => chrome.runtime.onMessage.removeListener(handleStateChanged));
</script>

<template>
  <main class="control-center">
    <MinimalHeader :settings-open="showSettings" :on-toggle-settings="() => { showSettings = !showSettings; }" />
    <transition name="settings" mode="out-in">
      <PipSettings v-if="showSettings" key="settings" :settings="settings" :on-save="saveSettings" />
      <PipStatus
        v-else
        key="status"
        :state="state"
        :busy="busy"
        :notice="notice"
        :on-toggle-pip="togglePip"
        :on-choose-video="chooseVideo"
        :on-select-video="selectVideo"
        :on-toggle-site-rule="toggleSiteRule"
      />
    </transition>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
  min-width: 380px;
  background: #fff;
  color: #20201e;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
}

:global(button),
:global(input),
:global(select) { font: inherit; }

.control-center {
  width: 380px;
  max-height: 560px;
  overflow: hidden;
  background: #fff;
}

.settings-enter-active,
.settings-leave-active { transition: opacity .18s ease, transform .18s ease; }
.settings-enter-from,
.settings-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
