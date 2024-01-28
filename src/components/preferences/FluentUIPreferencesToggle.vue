<template>
  <q-item>
    <q-item-section side>
      <q-toggle
        v-model="preferences.preferences.fluentUIMode"
        @update:model-value="console.log('update!')"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label>Fluent UI mode</q-item-label>
      <q-item-label caption>
        Enable experimental design mode that mimics the Fluent UI design style.
        Available only for Windows 11. Restart for changes to take effect
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';

const preferences = usePreferencesStore();
</script>
