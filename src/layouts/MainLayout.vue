<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="titlebar">
      <q-toolbar
        class="q-electron-drag"
        :style="{ paddingLeft: platform == 'mac' ? '80px' : '' }"
      >
        <q-btn
          dense
          round
          flat
          aria-label="Open menu"
          icon="menu"
          @click="drawerOpen = !drawerOpen"
        />

        <q-toolbar-title>
          {{ route.meta.title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      :mini="drawerMinified"
      @mouseover="drawerMinified = false"
      @mouseout="drawerMinified = true"
      bordered
      :width="200"
      :breakpoint="500"
      class="bg-grey-3"
    >
      <q-list>
        <div v-for="(item, i) in items" :key="i" :class="item?.class">
          <q-separator v-if="item.type == 'separator'" />
          <q-item v-else exact :to="item.to">
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section>
              {{ item.label }}
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const platform = useQuasar().platform.is.platform;

const drawerOpen = ref(true);
const drawerMinified = ref(true);

const { authenticated } = storeToRefs(useSpotifyAPIStore());

const items = computed(() => [
  { type: 'item', icon: 'home', label: 'Home', to: '/' },
  { type: 'item', icon: 'search', label: 'Search', to: '/search' },
  { type: 'item', icon: 'library_music', label: 'Library', to: '/library' },
  { type: 'separator' },
  {
    type: 'item',
    icon: 'login',
    label: 'Login into Spotify',
    to: '/login',
    class: authenticated.value ? '' : 'text-negative',
  },
  { type: 'item', icon: 'settings', label: 'Settings', to: '/settings' },
]);
</script>
