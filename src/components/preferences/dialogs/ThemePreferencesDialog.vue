<template>
  <q-dialog v-model="dialog">
    <q-card flat bordered class="tw-w-full">
      <q-card-section>
        <div class="text-h6">Theme preference</div>
      </q-card-section>

      <q-card-section>
        <q-option-group v-model="selected" :options="options" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';
import { ref, watch } from 'vue';

const dialog = defineModel<boolean>();
const preferences = usePreferencesStore();
const selected = ref(preferences.preferences.themePreference);
const options = [
  { label: 'Use system theme', value: 'system' },
  { label: 'Light theme', value: 'light' },
  { label: 'Dark theme', value: 'dark' },
];

watch(selected, (value) => {
  window.ipc.setThemePreference(value);
});
</script>
