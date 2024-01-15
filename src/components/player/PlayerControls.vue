<template>
  <div class="tw-flex tw-flex-col tw-items-center">
    <div class="text-caption" v-if="player.audio && player.loaded">
      {{ formatTrackDuration(player.currentTime) }}
      /
      {{ formatTrackDuration(player.audio.duration) }}
    </div>

    <div class="tw-flex tw-gap-6">
      <q-btn
        icon="replay_10"
        flat
        round
        :disabled="!player.loaded"
        @click="player.setTime(Math.max(player.currentTime - 10, 0))"
      />
      <q-btn
        icon="skip_previous"
        flat
        round
        :disabled="!player.hasPreviousItems"
        @click="player.playPrevious()"
      />
      <q-btn
        :icon="playButtonIcon"
        round
        color="primary"
        :disabled="player.track === undefined"
        @click="player.togglePause()"
      />
      <q-btn
        icon="skip_next"
        flat
        round
        :disabled="!player.hasNextItems"
        @click="player.playNextFromQueue()"
      />
      <q-btn
        icon="forward_10"
        flat
        round
        :disabled="!player.loaded"
        @click="
          player.setTime(
            Math.min(player.audio?.duration ?? 0, player.currentTime + 10)
          )
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from 'src/stores/player';
import { formatTrackDuration } from 'src/util';
import { computed } from 'vue';

const player = usePlayerStore();

const playButtonIcon = computed(() => {
  if (player.paused) {
    return 'play_arrow';
  } else {
    return 'pause';
  }
});
</script>
