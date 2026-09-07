<script setup lang="ts">
import { ref } from 'vue';
import { i18n } from '../../utils/i18n';
import type { PipCandidatePreview } from '../../utils/pipMessages';

defineProps<{
  candidates: PipCandidatePreview[];
  busy: boolean;
  onSelect: (candidateId: string) => void;
}>();

const failedPreviews = ref(new Set<string>());

function hideBrokenPreview(candidateId: string): void {
  failedPreviews.value = new Set([...failedPreviews.value, candidateId]);
}
</script>

<template>
  <section v-if="candidates.length" class="candidate-list" :aria-label="i18n.t('popup.detectedVideos')">
    <div class="list-heading">
      <span>{{ i18n.t('popup.detectedVideos') }}</span>
      <span>{{ candidates.length }}</span>
    </div>
    <div class="candidate-items">
      <button
        v-for="candidate in candidates"
        :key="candidate.id"
        type="button"
        class="candidate-card"
        :disabled="busy"
        @click="onSelect(candidate.id)"
      >
        <span class="preview">
          <span class="preview-fallback">{{ candidate.dimensions || i18n.t('popup.noPreview') }}</span>
          <img
            v-if="candidate.thumbnail && !failedPreviews.has(candidate.id)"
            :src="candidate.thumbnail"
            alt=""
            @error="hideBrokenPreview(candidate.id)"
          />
        </span>
        <span class="candidate-copy">
          <strong>{{ candidate.title }}</strong>
          <span class="candidate-meta">
            <span v-if="candidate.isPlaying" class="playing-badge">{{ i18n.t('videoPicker.playing') }}</span>
            <span v-if="candidate.duration">{{ candidate.duration }}</span>
            <span v-if="candidate.dimensions">{{ candidate.dimensions }}</span>
          </span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.candidate-list { display: grid; gap: 9px; }
.list-heading { display: flex; align-items: center; justify-content: space-between; color: #5f5f59; font-size: 11px; font-weight: 650; }
.list-heading span:last-child { min-width: 20px; padding: 2px 6px; border-radius: 6px; background: #f1f1ed; color: #75756f; text-align: center; }
.candidate-items { display: grid; gap: 7px; max-height: 254px; overflow: auto; padding-right: 2px; }
.candidate-card { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 9px; width: 100%; min-height: 56px; padding: 5px; border: 1px solid #e2e2de; border-radius: 9px; background: #fff; color: #343430; cursor: pointer; text-align: left; }
.candidate-card:hover:not(:disabled), .candidate-card:focus-visible { border-color: #a8a8a1; background: #fcfcfa; }
.candidate-card:disabled { cursor: wait; opacity: .6; }
.preview { position: relative; display: grid; min-height: 44px; overflow: hidden; border-radius: 6px; background: #eef0ee; place-items: center; }
.preview-fallback { padding: 4px; color: #787871; font-size: 9px; text-align: center; }
.preview img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.candidate-copy { display: grid; min-width: 0; align-content: center; gap: 4px; }
.candidate-copy strong { overflow: hidden; color: #30302c; font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.candidate-meta { display: flex; align-items: center; gap: 5px; overflow: hidden; color: #777770; font-size: 10px; white-space: nowrap; }
.playing-badge { padding: 1px 4px; border-radius: 4px; background: #e3f1e9; color: #26734f; font-weight: 650; }
</style>
