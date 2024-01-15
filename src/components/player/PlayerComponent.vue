<template>
  <div
    class="tw-relative tw-min-h-[80px] tw-pb-2 tw-pt-4 tw-px-4 tw-flex tw-items-center tw-gap-6"
  >
    <audio ref="audio" @ended="playbackEnded" @timeupdate="updateTime" />

    <PlayerTrackItem />

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

    <div
      class="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-rounded-full tw-bg-neutral-100 tw-px-4 tw-py-1 tw-z-20"
    >
      <PlayerControls />
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
import TrackAlbumCover from 'components/track/TrackAlbumCover.vue';
import { Ref, onMounted, ref } from 'vue';
import { joinArtistNames } from 'app/types/util';
import { useThrottleFn } from '@vueuse/core';
import MusicQueueMenu from 'components/queue/MusicQueueMenu.vue';
import PlayerControls from './PlayerControls.vue';
import PlayerTrackItem from './PlayerTrackItem.vue';

const audio: Ref<HTMLAudioElement | undefined> = ref(undefined);
const player = usePlayerStore();

onMounted(() => {
  player.audio = audio.value;
  if (audio.value) {
    audio.value.volume = player.volume;

    navigator.mediaSession.setActionHandler('pause', () => {
      player.togglePause();
    });
    navigator.mediaSession.setActionHandler('play', () => {
      player.togglePause();
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      if (details.seekOffset) {
        player.setTime(player.currentTime - details.seekOffset);
      } else {
        player.setTime(player.currentTime - 10);
      }
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      if (details.seekOffset) {
        player.setTime(player.currentTime + details.seekOffset);
      } else {
        player.setTime(player.currentTime + 10);
      }
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime) {
        player.setTime(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      player.playPrevious();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      player.playNextFromQueue();
    });
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
