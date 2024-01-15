<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="titlebar">
      <q-toolbar
        class="q-electron-drag"
        :style="{ paddingLeft: platform == 'mac' ? '80px' : '' }"
      >
        <q-btn
          dense
          round
          flat
          aria-label="Toggle drawer visibility"
          icon="menu"
          @click="drawerOpen = !drawerOpen"
        />

        <q-toolbar-title>
          {{ route.meta.title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <NavigationDrawer v-model="drawerOpen" />

    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer bordered class="tw-bg-white tw-text-black">
      <PlayerComponent />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import PlayerComponent from 'components/player/PlayerComponent.vue';
import { useRoute } from 'vue-router';
import NavigationDrawer from 'src/components/layout/NavigationDrawer.vue';
import { ref } from 'vue';

const drawerOpen = ref(true);

const route = useRoute();
const platform = useQuasar().platform.is.platform;
</script>
