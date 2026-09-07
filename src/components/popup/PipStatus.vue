<script setup lang="ts">
import { computed } from 'vue';
import { i18n } from '../../utils/i18n';
import type { PipState } from '../../utils/pipMessages';
import PipCandidateList from './PipCandidateList.vue';

const props = defineProps<{
  state: PipState | null;
  busy: boolean;
  notice: string;
  onTogglePip: () => void;
  onChooseVideo: () => void;
  onSelectVideo: (candidateId: string) => void;
  onToggleSiteRule: () => void;
}>();

const statusText = computed(() => {
  if (!props.state) return '';

  switch (props.state.status) {
    case 'active':
      return i18n.t('status.active');
    case 'ready':
      return i18n.t('status.ready', { count: props.state.candidateCount });
    case 'blocked':
      return i18n.t('status.blocked');
    case 'unsupported':
      return i18n.t('status.unsupported');
    case 'unavailable':
      return i18n.t('status.unavailable');
    default:
      return i18n.t('status.noVideo');
  }
});

const canTogglePip = computed(() => props.state?.status === 'ready' || props.state?.status === 'active');
const actionLabel = computed(() => props.state?.status === 'active'
  ? i18n.t('popup.exitPip')
  : i18n.t('popup.enterPip'));
const canChooseVideo = computed(() => (props.state?.candidateCount || 0) > 1 && props.state?.siteAllowed);
</script>

<template>
  <section class="status-panel">
    <div class="availability" :class="`availability-${state?.status || 'loading'}`">
      <span class="availability-dot" aria-hidden="true"></span>
      <div>
        <strong>{{ statusText }}</strong>
        <span v-if="state?.activeVideoTitle" class="active-title">{{ state.activeVideoTitle }}</span>
        <span v-if="notice" class="notice">{{ notice }}</span>
      </div>
    </div>

    <button
      type="button"
      class="primary-action"
      :disabled="!canTogglePip || busy"
      @click="onTogglePip"
    >
      {{ actionLabel }}
    </button>

    <button
      v-if="canChooseVideo"
      type="button"
      class="candidate-action"
      :disabled="busy"
      @click="onChooseVideo"
    >
      <span>{{ i18n.t('popup.chooseVideo') }}</span>
      <span class="candidate-count">{{ state?.candidateCount }}</span>
    </button>

    <PipCandidateList
      v-if="state?.siteAllowed"
      :candidates="state?.candidates || []"
      :busy="busy"
      :on-select="onSelectVideo"
    />

    <div class="site-rule">
      <div class="site-copy">
        <span class="site-name">{{ state?.currentSite || '...' }}</span>
        <span>{{ state?.siteAllowed ? i18n.t('popup.siteAllowed') : i18n.t('popup.siteBlocked') }}</span>
      </div>
      <button
        type="button"
        class="site-toggle"
        :class="{ 'site-toggle-on': state?.siteAllowed }"
        :aria-pressed="state?.siteAllowed"
        :aria-label="state?.siteAllowed ? i18n.t('popup.siteBlocked') : i18n.t('popup.siteAllowed')"
        :disabled="busy || !state || state.status === 'unavailable'"
        @click="onToggleSiteRule"
      >
        <span></span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.status-panel {
  display: grid;
  gap: 15px;
  padding: 24px 22px 20px;
}

.availability {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  padding: 8px 0;
  text-align: center;
}

.availability-dot {
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border-radius: 50%;
  background: #a0a09a;
  flex: 0 0 auto;
}

.availability-ready .availability-dot,
.availability-active .availability-dot {
  background: #21885d;
}

.availability-blocked .availability-dot,
.availability-unsupported .availability-dot,
.availability-unavailable .availability-dot {
  background: #9a6256;
}

.availability strong {
  display: block;
  color: #282825;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.5;
}

.active-title {
  display: block;
  max-width: 250px;
  overflow: hidden;
  color: #73736d;
  font-size: 11px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice {
  display: block;
  max-width: 250px;
  color: #9a6256;
  font-size: 11px;
  line-height: 1.5;
}

.primary-action,
.candidate-action {
  width: 100%;
  cursor: pointer;
  font-weight: 650;
}

.primary-action {
  min-height: 48px;
  border: 1px solid #20201e;
  border-radius: 10px;
  background: #20201e;
  color: #fff;
  font-size: 14px;
}

.primary-action:disabled,
.candidate-action:disabled,
.site-toggle:disabled {
  cursor: not-allowed;
  opacity: .45;
}

.candidate-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0db;
  border-radius: 9px;
  background: #fff;
  color: #3d3d38;
  font-size: 12px;
}

.candidate-count {
  min-width: 20px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f1f1ed;
  color: #6d6d67;
  font-size: 11px;
}

.candidate-placeholder { min-height: 40px; }

.site-rule {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  background: #f8f8f6;
}

.site-copy { display: grid; gap: 3px; min-width: 0; color: #72726c; font-size: 11px; }
.site-name { overflow: hidden; color: #3e3e39; font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }

.site-toggle {
  display: flex;
  justify-content: flex-start;
  width: 36px;
  height: 20px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  background: #b0b0aa;
  cursor: pointer;
}

.site-toggle-on { justify-content: flex-end; background: #252523; }
.site-toggle span { width: 16px; height: 16px; border-radius: 50%; background: #fff; }
</style>
