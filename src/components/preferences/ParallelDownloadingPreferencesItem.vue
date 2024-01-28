<template>
  <q-item clickable @click="dialog = true">
    <q-item-section>
      <q-item-label>Parallel downloading</q-item-label>
      <q-item-label caption
        >Choose the number of threads to use for downloading tracks in
        parralel.</q-item-label
      >
    </q-item-section>

    <ParallelDownloadingPreferencesDialog v-model="dialog" />
  </q-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ParallelDownloadingPreferencesDialog from './dialogs/ParallelDownloadingPreferencesDialog.vue';

const dialog = ref(false);
</script>
