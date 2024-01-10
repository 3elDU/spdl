<template>
  <!--
    Shows track index in the album/playlist/queue by default,
    but when hovered, shows a play button
  -->

  <q-item-section side ref="item" class="tw-w-[4rem] tw-flex tw-items-center">
    <inline-track-play-button
      :track="track"
      v-if="hovered || isPlaying"
      :placeholder="true"
      :switch-to-index="switchToIndex"
    />
    <q-item-label v-else>{{ props.index + 1 }}</q-item-label>
  </q-item-section>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { SPDL } from 'app/types';
import { computed, ref } from 'vue';
import InlineTrackPlayButton from './InlineTrackPlayButton.vue';
import { usePlayerStore } from 'src/stores/player';

const player = usePlayerStore();

const props = defineProps<{
  index: number;
  track: SPDL.Track;
  // Passed down to <inline-track-play-button>
  switchToIndex?: boolean;
}>();

const item = ref();
const hovered = useElementHover(item);

// Show a pause button when the track is already playing
const isPlaying = computed(
  () => player.track?.id === props.track.id && !player.paused
);
</script>
