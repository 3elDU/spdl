<template>
  <q-page>
    <VirtualTrackTable
      v-model:loading="loading"
      v-model="tracks"
      :fetch-more="fetchMore"
      :fetch-all="fetchAll"
    >
      <template #header>
        <HeaderCard class="tw-border-none">
          <template v-slot:avatar>
            <q-avatar size="192px" rounded class="bg-primary tw-text-white">
              <q-icon name="favorite" size="64px" color="white" />
            </q-avatar>
          </template>
          <template v-slot:overline>Favourite tracks</template>
          <template v-slot:title>{{ favourites?.total }} tracks</template>
        </HeaderCard>
      </template>
    </VirtualTrackTable>
  </q-page>
</template>

<script setup lang="ts">
import { Page, SavedTrack } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { transformNextURL } from 'src/util';
import { Ref, ref } from 'vue';
import VirtualTrackTable from 'src/components/lists/VirtualTrackTable.vue';
import HeaderCard from 'src/components/cards/HeaderCard.vue';

const spotify = useSpotifyAPIStore();

const loading = ref(true);
const favourites: Ref<Page<SavedTrack> | undefined> = ref(undefined);
const tracks: Ref<SPDL.Track[]> = ref([]);
let next: string | null = null;

// Load initial 50 entries
async function load() {
  loading.value = true;

  const _favourites = await spotify.api.currentUser.tracks.savedTracks(50);
  favourites.value = _favourites;

  tracks.value.push(
    ..._favourites.items.map((item) => fromSpotifyTrack(item.track))
  );

  next = _favourites.next;

  loading.value = false;
}
load();

async function fetchMore() {
  if (!next) {
    return;
  }

  const _tracks = await spotify.api.makeRequest<Page<SavedTrack>>(
    'GET',
    transformNextURL(next)
  );
  next = _tracks.next;

  tracks.value.push(
    ..._tracks.items.map((item) => fromSpotifyTrack(item.track))
  );
}

async function fetchAll() {
  if (!next || !favourites.value) {
    return;
  }

  tracks.value = (
    await spotify.fetchAllPaginated<SavedTrack>(next, favourites.value.total)
  ).map((item) => fromSpotifyTrack(item.track));
  next = null;
}
</script>
