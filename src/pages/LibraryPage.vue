<template>
  <q-page
    v-if="loading"
    padding
    class="tw-flex tw-justify-center tw-items-center"
  >
    <q-spinner size="64px" />
  </q-page>
  <q-page
    v-else
    padding
    class="tw-grid tw-auto-rows-max tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-gap-4"
  >
    <SyncedLikedTracksCard :liked-tracks-count="likedTracksCount" />
    <SyncedPlaylistCard
      v-for="(playlist, idx) in playlists"
      :key="idx"
      :playlist="playlist"
    />
  </q-page>
</template>

<script setup lang="ts">
import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import SyncedLikedTracksCard from 'src/components/cards/SyncedLikedTracksCard.vue';
import SyncedPlaylistCard from 'src/components/cards/SyncedPlaylistCard.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { ref, Ref } from 'vue';

const spotify = useSpotifyAPIStore();
const loading = ref(true);
const likedTracksCount: Ref<number> = ref(0);
const playlists: Ref<SimplifiedPlaylist[]> = ref([]);

async function load() {
  likedTracksCount.value = (
    await spotify.api.currentUser.tracks.savedTracks(1)
  ).total;
  playlists.value = (
    await spotify.api.currentUser.playlists.playlists(50)
  ).items;
  loading.value = false;
}

load();
</script>
