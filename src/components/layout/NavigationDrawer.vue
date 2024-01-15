<template>
  <q-drawer
    v-model="model"
    :mini="drawerMinified"
    @mouseover="drawerMinified = false"
    @mouseout="drawerMinified = true"
    bordered
    :width="200"
    :breakpoint="500"
    class="bg-grey-3"
  >
    <q-list>
      <div v-for="(item, i) in destinations" :key="i" :class="item?.class">
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
</template>

<script setup lang="ts">
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

const model = defineModel<boolean>({ default: false });

const drawerMinified = ref(true);

const { authenticated } = storeToRefs(useSpotifyAPIStore());
const destinations = computed(() => [
  { type: 'item', icon: 'home', label: 'Home', to: '/' },
  { type: 'item', icon: 'search', label: 'Search', to: '/search' },
  { type: 'item', icon: 'library_music', label: 'Library', to: '/library' },
  { type: 'separator' },
  {
    type: 'item',
    icon: 'login',
    label: 'Login into Spotify',
    to: '/login',
    // If not authenticated, add a red tint to icon and text color
    class: authenticated.value ? '' : 'text-negative',
  },
  { type: 'item', icon: 'settings', label: 'Settings', to: '/settings' },
]);
</script>
