<template>
  <q-btn
    v-if="existsOnDisk"
    size="sm"
    flat
    round
    :icon="buttonIcon"
    @click="click"
  />
</template>

<script setup lang="ts">
import { useKeyModifier } from '@vueuse/core';
import { SPDL } from 'app/types';
import { usePlayerStore } from 'src/stores/player';
import { useQueueStore } from 'src/stores/queue';
import { Ref, computed, ref, toRaw } from 'vue';

const { track } = defineProps<{
  track: SPDL.Track;
}>();

const queue = useQueueStore();
const player = usePlayerStore();
// When holding Shift and clicking a button, a track will be added to queue,
// instead of playing immediately
const shiftPressed = useKeyModifier('Shift');

const buttonIcon = computed(() => {
  if (player.track?.id === track.id && !player.paused) {
    return 'pause';
  } else if (shiftPressed.value) {
    return 'add_to_queue';
  } else {
    return 'play_arrow';
  }
});

function click() {
  if (player.track?.id === track.id && !player.paused) {
    player.pause();
  } else if (shiftPressed.value) {
    player.addToQueue(track);
  } else {
    player.playTrack(track);
  }
}

const existsOnDisk: Ref<string | undefined> = ref(undefined);

// There is a time period, when ffmpeg started converting the track to .mp3, but
// in the queue, it is still marked is pending (because it is, it isn't yet fully converted).
// So, we either check if the queue has this track marked as completed, or that the queue
// doesn't include this track at all

const queueItem = queue.items.find((item) => item.track.id === track.id);
if ((queueItem && queueItem.status === 'success') || queueItem === undefined) {
  window.ipc
    .trackExistsOnDisk(toRaw(track))
    .then((exists) => (existsOnDisk.value = exists));
}
</script>
