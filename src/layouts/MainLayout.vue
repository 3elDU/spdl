<template>
  <q-layout view="hHh Lpr fFf">
    <HeaderComponent v-model="drawerOpen" />
    <NavigationDrawer v-model="drawerOpen" />

    <q-page-container>
      <router-view
        class="tw-bg-white dark:tw-bg-neutral-900"
        :drawer-open="drawerOpen"
      />
    </q-page-container>

    <q-footer
      bordered
      class="tw-bg-white tw-text-black dark:tw-bg-neutral-800 dark:tw-text-white"
    >
      <PlayerComponent />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import PlayerComponent from 'components/player/PlayerComponent.vue';
import NavigationDrawer from 'src/components/layout/NavigationDrawer.vue';
import { ref } from 'vue';
import HeaderComponent from 'src/components/layout/HeaderComponent.vue';

const drawerOpen = ref(true);
</script>
