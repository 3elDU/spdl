<template>
  <q-page padding class="column q-px-xl q-gutter-xl">
    <SearchComponent
      :initial-query="query"
      :initial-search-local-option="performLocalSearch"
      :loading="searching"
      @search="performSearch"
    />

    <q-table
      v-if="tracks.length !== 0"
      flat
      :rows="tracks"
      :columns="columns"
      hide-header
    >
      <template v-slot:body-cell-albumURL="props">
        <q-td :props="props">
          <TrackAlbumCover size="64px" :track="props.row" show-play-button />
        </q-td>
      </template>
      <template v-slot:body-cell-trackDisplayName="props">
        <q-td :props="props">
          <q-item>
            <q-item-section>
              <q-item-label>{{ props.value }}</q-item-label>
              <q-item-label caption>
                {{ joinArtistNames(props.row.artists, ', ') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template v-slot:body-cell-duration="props">
        <q-td v-if="!searchedLocal" :props="props">
          <div class="tw-inline-flex tw-items-center tw-gap-2">
            {{ formatTrackDuration(props.value) }}
            <TrackDownloadProgress :track="props.row" show-download-button />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar';
import SearchComponent from 'src/components/SearchComponent.vue';
import TrackDownloadProgress from 'src/components/TrackDownloadProgress.vue';
import TrackAlbumCover from 'src/components/TrackAlbumCover.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { formatTrackDuration } from 'src/util/util';
import { Ref, ref } from 'vue';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import { joinArtistNames } from 'app/types/util';

const tracks: Ref<SPDL.Track[]> = ref([]);

const columns: QTableColumn[] = [
  {
    name: 'albumURL',
    label: 'Album cover',
    field: (row: SPDL.Track) => row.album.cover_url,
    align: 'left',
    sortable: false,
    style: 'width: 64px',
    headerStyle: 'width: 64px',
  },
  {
    name: 'trackDisplayName',
    label: 'Track name',
    field: (row: SPDL.Track) => row.name,
    align: 'left',
  },
  {
    name: 'duration',
    label: 'Track duration',
    field: (row: SPDL.Track) => row.duration,
    align: 'right',
  },
];

const spotify = useSpotifyAPIStore();

const { query, performLocalSearch } = withDefaults(
  defineProps<{
    query?: string;
    performLocalSearch?: boolean;
  }>(),
  {
    query: '',
    performLocalSearch: false,
  }
);

const searching = ref(false);
const searchedLocal = ref(performLocalSearch);

if (query !== '') {
  performSearch(query, performLocalSearch);
}

async function performSearch(query: string, searchLocal: boolean) {
  if (query === '') {
    return;
  }

  searching.value = true;

  if (searchLocal) {
    tracks.value = await window.ipc.searchLocal(query);
    searchedLocal.value = true;
  } else {
    const res = await spotify.api.search(query, ['track'], undefined, 50);
    tracks.value = res.tracks.items.map((track) => fromSpotifyTrack(track));
    searchedLocal.value = false;
  }

  searching.value = false;
}
</script>
