<template>
  <q-page padding class="q-px-xl column q-gutter-md">
    <search-component @search="search" />
    <div class="row tw-gap-4">
      <q-card flat bordered class="tw-flex-grow">
        <q-card-section class="text-h4">1234</q-card-section>
        <q-card-section class="tw-pt-0">Tracks in library</q-card-section>
      </q-card>

      <q-card flat bordered class="tw-flex-grow">
        <q-card-section class="text-h4">8.4 GB</q-card-section>
        <q-card-section class="tw-pt-0">Library size</q-card-section>
      </q-card>

      <q-card
        flat
        bordered
        class="tw-flex-grow tw-h-32 tw-max-w-[40%] tw-min-w-fit"
      >
        <q-card-section horizontal>
          <img src="/src/assets/album.jpg" class="tw-h-32" />

          <q-card-section class="column justify-between">
            <div>
              <div class="tw-text-xl tw-font-normal ellipsis">
                Playlist name
              </div>
              <div class="text-caption text-grey">100 tracks</div>
            </div>

            <div class="text-caption text-grey">Last synced: 23:59 23/12</div>
          </q-card-section>

          <q-card-actions class="tw-mt-auto tw-ml-auto">
            <q-btn dense outline color="primary" icon="sync">Sync</q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </div>

    <download-queue />
  </q-page>
</template>

<script setup lang="ts">
import DownloadQueue from 'src/components/DownloadQueue.vue';
import SearchComponent from 'src/components/SearchComponent.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function search(query: string, searchLocal: boolean) {
  // Open the search page with the entered values
  router.push({
    name: 'search',
    query: {
      query: query,
      searchLocal: searchLocal.toString(),
    },
  });
}
</script>
