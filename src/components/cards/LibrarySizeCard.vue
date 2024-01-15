<template>
  <q-card flat bordered class="tw-relative">
    <q-card-section v-if="stats" class="text-h4"
      >{{
        stats.sizeMB.toLocaleString(undefined, { maximumFractionDigits: 0 })
      }}
      MB</q-card-section
    >
    <q-card-section v-else>
      <q-spinner size="40px" />
    </q-card-section>

    <q-card-section class="tw-pt-0">Library size</q-card-section>

    <q-btn
      flat
      round
      color="primary"
      icon="refresh"
      title="refresh"
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
