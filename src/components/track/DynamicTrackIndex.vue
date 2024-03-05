<template>
  <!--
    Shows track index in the album/playlist/queue by default,
    but when hovered, shows a play button
  -->

  <q-item-section side ref="item" class="tw-w-[3rem] tw-flex tw-items-center">
    <q-skeleton v-if="loading" type="text" width="1rem" />
    <inline-track-play-button
      v-else-if="track && (hovered || isPlaying)"
      :track="track"
      :switch-to-index="switchToIndex"
    />
    <q-item-label v-else>{{ props.index + 1 }}</q-item-label>
  </q-item-section>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { SPDL } from 'app/types';
import { computed, ref } from 'vue';
import InlineTrackPlayButton from 'components/track/InlineTrackPlayButton.vue';
import { usePlayerStore } from 'src/stores/player';
import { storeToRefs } from 'pinia';

const { track: playerTrack, paused } = storeToRefs(usePlayerStore());

const props = defineProps<{
  loading?: boolean;
  index: number;
  track?: SPDL.Track;
  // Passed down to <inline-track-play-button>
  switchToIndex?: boolean;
}>();

const item = ref();
const hovered = useElementHover(item);

// Show a pause button when the track is already playing
const isPlaying = computed(
  () => playerTrack.value?.id === props.track!.id && !paused.value
);
</script>
