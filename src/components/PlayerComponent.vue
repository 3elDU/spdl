<template>
  <div
    class="tw-relative tw-min-h-[80px] tw-pb-2 tw-pt-4 tw-px-4 tw-flex tw-items-center tw-gap-6"
  >
    <audio
      class="tw-display-none"
      ref="audio"
      @ended="playbackEnded"
      @timeupdate="updateTime"
    />

    <div v-if="player.track" class="tw-flex tw-items-center">
      <TrackAlbumCover :track="player.track" size="64px" />
      <q-item>
        <q-item-section>
          <q-item-label>{{ player.track.name }}</q-item-label>
          <q-item-label caption>{{
            joinArtistNames(player.track.artists || [], ', ')
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </div>

    <div
      class="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-flex tw-flex-col tw-items-center"
    >
      <div class="text-caption" v-if="audio && player.loaded">
        {{ formatTrackDuration(player.currentTime) }}
        /
        {{ formatTrackDuration(audio.duration) }}
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
              Math.min(audio?.duration ?? 0, player.currentTime + 10)
            )
          "
        />
      </div>
    </div>
    <div
      v-if="audio && player.loaded"
      class="tw-absolute tw-h-[32px] tw-left-0 tw-right-0 tw-top-0 -tw-translate-y-1/2 tw-z-50"
    >
      <q-slider
        :min="0"
        :max="audio.duration"
        :step="1"
        snap
        :model-value="player.currentTime"
        @update:model-value="player.setTime"
        class="!tw-rounded-none"
      />
    </div>

    <q-slider
      class="tw-w-[96px] tw-ml-auto"
      color="primary"
      :min="0"
      :max="1"
      :step="0.01"
      snap
      :model-value="player.volume"
      @update:model-value="(value) => player.setVolume(value || 0)"
      label
      :label-value="(player.volume * 100).toFixed(0) + '%'"
    >
    </q-slider>

    <q-btn round flat icon="queue_music">
      <q-badge v-if="player.hasNextItems" floating>{{
        player.countNextItems.toString()
      }}</q-badge>

      <MusicQueueMenu />
    </q-btn>
  </div>
</template>

<style>
.q-slider__track {
  border-radius: 0 !important;
}

.q-slider__inner {
  background: lightgray !important;
}
</style>

<script setup lang="ts">
import { usePlayerStore } from 'src/stores/player';
import TrackAlbumCover from './TrackAlbumCover.vue';
import { Ref, computed, onMounted, ref } from 'vue';
import { joinArtistNames } from 'app/types/util';
import { useThrottleFn } from '@vueuse/core';
import { formatTrackDuration } from 'src/util/util';
import MusicQueueMenu from './playerQueueMenu/MusicQueueMenu.vue';

const audio: Ref<HTMLAudioElement | undefined> = ref(undefined);
const player = usePlayerStore();

onMounted(() => {
  player.audio = audio.value;
  if (audio.value) {
    audio.value.volume = player.volume;
  }
});

const playButtonIcon = computed(() => {
  if (player.paused) {
    return 'play_arrow';
  } else {
    return 'pause';
  }
});

// Play the next track in the queue, when the current track ended
function playbackEnded() {
  if (!audio.value) {
    return;
  }

  // If there are no items in the queue, reset the playback to beginning and pause
  if (!player.hasNextItems) {
    player.pause();
  } else {
    player.playNextFromQueue();
  }
}

const updateTime = useThrottleFn(() => {
  if (audio.value) {
    player.currentTime = audio.value.currentTime;
  }
}, 1000);
</script>
