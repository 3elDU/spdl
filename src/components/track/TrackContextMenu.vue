<template>
  <q-menu
    touch-position
    context-menu
    class="track-context-menu"
    @before-show="beforeShow"
  >
    <q-list>
      <q-item clickable v-close-popup @click="player.playTrack(track)">
        <q-item-section avatar>
          <q-icon name="play_arrow" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Play</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="player.addToQueue(track)">
        <q-item-section avatar>
          <q-icon name="playlist_add" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Add to queue</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item clickable v-close-popup @click="download">
        <q-item-section avatar>
          <q-icon name="download" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Download</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="chooseSource">
        <q-item-section avatar>
          <q-icon name="rule" />
        </q-item-section>
        <q-item-section>
          <q-item-label
            title="Search YouTube and choose a custom source for the track"
            >Choose source for download</q-item-label
          >
        </q-item-section>
      </q-item>

      <q-separator v-if="existsOnDisk" />

      <q-item
        clickable
        v-close-popup
        v-if="existsOnDisk"
        @click="openTrackLocation"
      >
        <q-item-section avatar>
          <q-icon name="open_in_new" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Show track in file explorer</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup v-if="existsOnDisk" disable>
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Show detailed info</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        clickable
        v-close-popup
        v-if="existsOnDisk"
        @click="deleteFromDisk"
      >
        <q-item-section avatar>
          <q-icon name="delete" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Delete from disk</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<style>
.track-context-menu {
  @apply tw-shadow-none tw-border tw-border-neutral-300 dark:tw-border-neutral-600;
}
</style>

<script setup lang="ts">
import TrackSourceChooserDialog from 'components/track/dialogs/TrackSourceChooserDialog.vue';
import { SPDL } from 'app/types';
import { usePlayerStore } from 'src/stores/player';
import { ref, toRaw } from 'vue';
import { useQuasar } from 'quasar';

const quasar = useQuasar();

const props = defineProps<{
  track: SPDL.Track;
}>();

const existsOnDisk = ref(false);
const player = usePlayerStore();

function beforeShow() {
  window.ipc
    .trackExistsOnDisk(toRaw(props.track))
    .then((path) => (existsOnDisk.value = typeof path === 'string'));
}

function download() {
  window.ipc.downloadTrack(toRaw(props.track), true);
}

function deleteFromDisk() {
  window.ipc.deleteTrack(toRaw(props.track));
}

function openTrackLocation() {
  window.ipc.openTrackLocation(toRaw(props.track));
}

function chooseSource() {
  quasar.dialog({
    component: TrackSourceChooserDialog,
    componentProps: {
      track: props.track,
    },
  });
}
</script>
