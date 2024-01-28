<template>
  <q-item clickable @click="dialog = true">
    <q-item-section>
      <q-item-label>Theme</q-item-label>
      <q-item-label caption>
        Currently using {{ preferences.preferences.themePreference }} theme.
      </q-item-label>
    </q-item-section>

    <ThemePreferencesDialog v-model="dialog" />
  </q-item>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';
import { ref } from 'vue';
import ThemePreferencesDialog from './dialogs/ThemePreferencesDialog.vue';

const dialog = ref(false);
const preferences = usePreferencesStore();
</script>
