<template>
  <q-item clickable @click="dialog = true">
    <q-item-section>
      <q-item-label>Music directory</q-item-label>
      <q-item-label caption>
        Select a directory where to save all downloaded music.<br />
        Current directory: {{ preferences.preferences.musicDirectory }}
      </q-item-label>
    </q-item-section>

    <MusicDirectoryPreferencesDialog v-model="dialog" />
  </q-item>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';
import { ref } from 'vue';
import MusicDirectoryPreferencesDialog from './dialogs/MusicDirectoryPreferencesDialog.vue';

const preferences = usePreferencesStore();

const dialog = ref(false);
</script>
