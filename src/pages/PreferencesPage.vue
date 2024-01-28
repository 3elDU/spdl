<template>
  <q-page>
    <q-list padding>
      <q-item-label header> General </q-item-label>

      <MusicDirectoryPreferencesItem />

      <ParallelDownloadingPreferencesItem />

      <ThemePreferencesItem />

      <q-separator spaced />
      <q-item-label header class="tw-text-red-600">
        Experimental settings
      </q-item-label>

      <FluentUIPreferencesToggle />
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import MusicDirectoryPreferencesItem from 'components/preferences/MusicDirectoryPreferencesItem.vue';
import FluentUIPreferencesToggle from 'src/components/preferences/FluentUIPreferencesToggle.vue';
import ParallelDownloadingPreferencesItem from 'src/components/preferences/ParallelDownloadingPreferencesItem.vue';
import ThemePreferencesItem from 'src/components/preferences/ThemePreferencesItem.vue';
</script>
