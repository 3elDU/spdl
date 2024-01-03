<template>
  <q-page padding class="q-px-xl column q-gutter-md">
    <search-component @search="search" />
    <div class="row tw-gap-4">
      <q-card flat bordered class="tw-flex-grow tw-relative">
        <q-card-section v-if="stats" class="text-h4">{{
          stats.tracks
        }}</q-card-section>
        <q-card-section v-else>
          <q-spinner size="40px" />
        </q-card-section>

        <q-card-section class="tw-pt-0">Tracks in library</q-card-section>

        <q-btn
          flat
          round
          color="primary"
          icon="refresh"
          title="Refresh"
          class="tw-absolute tw-top-2 tw-right-2"
          @click="loadLibraryStats"
        />
      </q-card>

      <q-card flat bordered class="tw-flex-grow">
        <q-card-section v-if="stats" class="text-h4"
          >{{
            stats.sizeMB.toLocaleString(undefined, { maximumFractionDigits: 0 })
          }}
          MB</q-card-section
        >
        <q-card-section v-else>
          <q-spinner size="40px" />
        </q-card-section>

        <q-card-section class="tw-pt-0">Library size</q-card-section>

        <q-btn
          flat
          round
          color="primary"
          icon="refresh"
          title="refresh"
          class="tw-absolute tw-top-2 tw-right-2"
          @click="loadLibraryStats"
        />
      </q-card>

      <q-carousel
        v-if="preferences.syncedPlaylists.length > 0"
        ref="carousel"
        v-model="selectedPlaylist"
        vertical
        animated
        transition-prev="slide-down"
        transition-next="slide-up"
        class="tw-flex-grow tw-h-32 tw-max-w-[40%] tw-min-w-fit"
      >
        <q-carousel-slide
          v-for="playlist in preferences.syncedPlaylists"
          :key="playlist.id"
          :name="playlist.id"
          class="tw-p-0"
        >
          <q-card flat bordered class="tw-h-32 tw-relative">
            <q-card-section horizontal>
              <img
                v-if="playlist.cover"
                :src="playlist.cover"
                class="tw-w-32 tw-h-32 tw-aspect-square"
              />
              <div
                v-else
                class="tw-w-32 tw-h-32 bg-grey-4 tw-aspect-square tw-flex tw-justify-center tw-items-center"
              >
                No image
              </div>

              <q-card-section class="tw-overflow-hidden">
                <div
                  class="text-h6 tw-font-normal tw-truncate"
                  :title="playlist.name"
                >
                  {{ playlist.name.length > 0 ? playlist.name : 'No name' }}
                </div>
                <div class="text-caption text-grey">
                  {{ playlist.tracksCount }} tracks
                </div>

                <div class="text-caption text-grey tw-truncate">
                  Last synced:<br />
                  {{ formatDateTime(new Date(playlist.lastSynced)) }}
                </div>
              </q-card-section>

              <q-card-actions vertical class="tw-ml-auto">
                <q-btn
                  dense
                  flat
                  round
                  icon="keyboard_arrow_up"
                  @click="carousel?.previous()"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="keyboard_arrow_down"
                  @click="carousel?.next()"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="sync"
                  color="primary"
                  @click="syncPlaylist(playlist.id)"
                />
              </q-card-actions>
            </q-card-section>
          </q-card>
        </q-carousel-slide>
      </q-carousel>
    </div>
    <download-queue />
  </q-page>
</template>

<style>
/* Hide scrollbar from a carousel */
.q-carousel > div > .scroll {
  overflow: hidden;
}
</style>

<script setup lang="ts">
import DownloadQueue from 'src/components/DownloadQueue.vue';
import SearchComponent from 'src/components/SearchComponent.vue';
import { usePreferencesStore } from 'src/stores/preferences';
import { Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatDateTime } from '../util/util';
import { syncPlaylist } from 'src/sync/sync';
import { storeToRefs } from 'pinia';
import { QCarousel } from 'quasar';
import { LibraryStats } from 'app/src-electron/stat/stat';

const router = useRouter();

const stats: Ref<LibraryStats | undefined> = ref(undefined);
function loadLibraryStats() {
  stats.value = undefined;
  window.ipc.statLibrary().then((receivedStats) => {
    stats.value = receivedStats;
  });
}
loadLibraryStats();

const { preferences } = storeToRefs(usePreferencesStore());
const selectedPlaylist = ref(preferences.value.syncedPlaylists.at(0)?.id);

const carousel: Ref<QCarousel | undefined> = ref(undefined);

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
