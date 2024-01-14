<template>
  <q-btn size="sm" flat round :icon="buttonIcon" @click="click" />
</template>

<script setup lang="ts">
import { useKeyModifier } from '@vueuse/core';
import { SPDL } from 'app/types';
import { usePlayerStore } from 'src/stores/player';
import { useQueueStore } from 'src/stores/queue';
import { Ref, computed, ref, toRaw } from 'vue';

const props = withDefaults(
  defineProps<{
    track: SPDL.Track;
    // If the track already exists in the history, switch to that index in the history,
    // rather than playing a track at a current position
    switchToIndex?: boolean;
  }>(),
  {
    switchToIndex: false,
  }
);

const queue = useQueueStore();
const player = usePlayerStore();
// When holding Shift and clicking a button, a track will be added to queue,
// instead of playing immediately
const shiftPressed = useKeyModifier('Shift');

const buttonIcon = computed(() => {
  if (player.track?.id === props.track.id && !player.paused) {
    return 'pause';
  } else if (shiftPressed.value) {
    return 'playlist_add';
  } else {
    return 'play_arrow';
  }
});

async function click() {
  const track = structuredClone(toRaw(props.track));

  let streamingURL: string | undefined = undefined;
  if (!track.stream_url && !existsOnDisk.value) {
    streamingURL = await window.ipc.getStreamingURL(toRaw(props.track));
    track.stream_url = streamingURL;
  }

  if (player.track?.id === props.track.id && !player.paused) {
    player.pause();
  } else if (shiftPressed.value) {
    player.addToQueue(track);
  } else {
    const trackIdx = player.history.findIndex(
      (track) => props.track.id === track.id
    );

    if (props.switchToIndex && trackIdx !== -1) {
      player.playFromIndex(trackIdx);
    } else {
      player.playTrack(track);
    }
  }
}

const existsOnDisk: Ref<string | undefined> = ref(undefined);

// There is a time period, when ffmpeg started converting the track to .mp3, but
// in the queue, it is still marked is pending (because it is, it isn't yet fully converted).
// So, we either check if the queue has this track marked as completed, or that the queue
// doesn't include this track at all

const queueItem = queue.items.find((item) => item.track.id === props.track.id);
if ((queueItem && queueItem.status === 'success') || queueItem === undefined) {
  window.ipc
    .trackExistsOnDisk(toRaw(props.track))
    .then((exists) => (existsOnDisk.value = exists));
}
</script>
