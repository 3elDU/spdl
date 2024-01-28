<template>
  <q-header bordered class="">
    <q-toolbar
      class="q-electron-drag"
      :style="{ paddingLeft: Platform.is.mac ? '80px' : '' }"
    >
      <q-btn
        dense
        round
        flat
        aria-label="Toggle drawer visibility"
        icon="menu"
        @click="drawerOpen = !drawerOpen"
      />

      <GoBackButton />
      <GoForwardButton />

      <q-toolbar-title>
        {{ route.meta.title }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { Platform } from 'quasar';
import { useRoute } from 'vue-router';
import GoBackButton from './GoBackButton.vue';
import GoForwardButton from './GoForwardButton.vue';

const drawerOpen = defineModel<boolean>();
const route = useRoute();
</script>
