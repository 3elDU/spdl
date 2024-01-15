<template>
  <q-card flat bordered class="tw-relative">
    <q-card-section v-if="stats" class="text-h4">{{
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

function loadLibraryStats() {
  stats.value = undefined;
  window.ipc.statLibrary().then((value) => (stats.value = value));
}
loadLibraryStats();
</script>
