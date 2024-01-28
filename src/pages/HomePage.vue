<template>
  <q-page padding class="tw-flex tw-flex-col tw-gap-4">
    <SearchComponent @search="search" />

    <div class="tw-flex tw-flex-row tw-gap-4 tw-flex-wrap">
      <LibraryTracksCountCard class="tw-flex-grow" />
      <LibrarySizeCard class="tw-flex-grow" />
      <SyncedPlaylistsCarousel />
    </div>

    <DownloadQueue v-if="queue.items.length" />
  </q-page>
</template>

<style>
/* Hide scrollbar from a carousel */
.q-carousel > div > .scroll {
  overflow: hidden;
}
</style>

<script setup lang="ts">
import LibrarySizeCard from 'components/cards/LibrarySizeCard.vue';
import LibraryTracksCountCard from 'components/cards/LibraryTracksCountCard.vue';
import DownloadQueue from 'src/components/DownloadQueue.vue';
import SyncedPlaylistsCarousel from 'src/components/carousels/SyncedPlaylistsCarousel.vue';
import SearchComponent from 'src/components/inputs/SearchComponent.vue';
import { useQueueStore } from 'src/stores/queue';
import { useRouter } from 'vue-router';

const router = useRouter();
const queue = useQueueStore();

function search(query: string, searchLocal: boolean) {
  // Open the search page with the entered values
  router.push({
    name: 'search',
    query: {
      query: query,
      performLocalSearch: searchLocal.toString(),
    },
  });
}
</script>
