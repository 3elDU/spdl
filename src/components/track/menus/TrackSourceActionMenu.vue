<template>
  <q-menu touch-position>
    <q-list>
      <q-item
        clickable
        v-close-popup
        :href="`https://youtube.com/watch?v=${video.id}`"
        target="_blank"
      >
        <q-item-section avatar>
          <q-icon name="open_in_new" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Open in browser</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="stream">
        <q-item-section avatar>
          <q-icon name="play_arrow" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Play</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="download">
        <q-item-section avatar>
          <q-icon name="download" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Download</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { SPDL } from 'app/types';
import { usePlayerStore } from 'src/stores/player';
import { toRaw } from 'vue';
import { Video } from 'youtube-sr';

const props = defineProps<{
  track: SPDL.Track;
  video: Video;
}>();

const track = structuredClone(toRaw(props.track));
track.video_id = props.video.id!;

async function stream() {
  usePlayerStore().playTrack(track);
}

async function download() {
  await window.ipc.downloadTrack(track, true);
}
</script>
