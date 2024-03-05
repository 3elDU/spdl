<template>
  <q-card flat bordered class="tw-relative">
    <q-card-section v-if="error" class="text-h4 text-red">
      Error!
    </q-card-section>
    <q-card-section v-else-if="stats" class="text-h4">{{
      stats.tracks
    }}</q-card-section>
    <q-card-section v-else>
      <q-spinner size="40px" />
    </q-card-section>

    <q-card-section class="tw-pt-0">Tracks in library</q-card-section>

    <q-btn
      flat
      round
      color="primary"
      icon="refresh"
      title="Refresh"
      class="tw-absolute tw-top-2 tw-right-2"
      @click="loadLibraryStats"
    />
  </q-card>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import LibraryStats from 'app/types/stat';

const stats: Ref<LibraryStats | undefined> = ref(undefined);
const error: Ref<boolean> = ref(false);

function loadLibraryStats() {
  stats.value = undefined;
  window.ipc.statLibrary().then((value) => {
    if (value === undefined) {
      error.value = true;
    } else {
      stats.value = value;
    }
  });
}
loadLibraryStats();
</script>
