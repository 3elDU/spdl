<template>
  <q-avatar
    :size="size"
    rounded
    class="tw-flex tw-justify-center tw-items-center tw-relative tw-bg-neutral-400"
    @mouseenter="mouseHovering = true"
    @mouseleave="mouseHovering = false"
  >
    <img
      v-if="track.album.cover"
      :src="bufferToImage(track.album.cover)"
      class="tw-absolute"
      loading="lazy"
      decoding="async"
    />
    <img
      v-else-if="track.album.cover_url"
      :src="track.album.cover_url"
      class="tw-absolute tw-rounded"
      loading="lazy"
      decoding="async"
    />
    <div
      v-else
      class="tw-absolute tw-rounded w-full h-full tw-flex tw-items-center tw-justify-center tw-bg-neutral-300 text-h4"
    >
      No image
    </div>

    <InlineTrackPlayButton
      v-if="showPlayButton && mouseHovering"
      :track="track"
      class="tw-bg-white"
    />
  </q-avatar>
</template>

<script setup lang="ts">
import { Buffer } from 'buffer';
import InlineTrackPlayButton from 'components/track/InlineTrackPlayButton.vue';
import { SPDL } from 'app/types';
import { ref } from 'vue';

const mouseHovering = ref(false);

withDefaults(
  defineProps<{
    size?: string;
    track: SPDL.Track;
    showPlayButton?: boolean;
  }>(),
  {
    size: '40px',
    showPlayButton: false,
  }
);

// Converts a raw buffer into a base64-encoded image
function bufferToImage(array: Uint8Array): string {
  const base64 = Buffer.from(array).toString('base64');
  return 'data:image/jpeg;base64,' + base64;
}
</script>
