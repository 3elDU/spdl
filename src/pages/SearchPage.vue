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
          <q-avatar size="64px" rounded class="tw-absolute">
            <img v-if="typeof props.value === 'string'" :src="props.value" />
            <img v-else :src="bufferToImage(props.value)" />
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-trackDisplayName="props">
        <q-td :props="props">
          <q-item>
            <q-item-section>
              <q-item-label>{{ props.value }}</q-item-label>
              <q-item-label caption>
                {{ props.row.artist_names.join(', ') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template v-slot:body-cell-duration="props">
        <q-td v-if="!searchedLocal" :props="props">
          <div class="tw-inline-flex tw-items-center tw-gap-2">
            {{ formatTrackDuration(props.value) }}
            <TrackDownloadProgress
              :track="props.row.track"
              show-download-button
            />
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
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { formatTrackDuration } from 'src/util/util';
import { spotifyTrackToSearchResult } from 'src/util/util';
import { Ref, ref, toRaw } from 'vue';
import { Buffer } from 'buffer';

const tracks: Ref<TrackSearchResult[]> = ref([]);

const columns: QTableColumn[] = [
  {
    name: 'albumURL',
    label: 'Album cover',
    field: (row: TrackSearchResult) => row.album_cover_image,
    align: 'left',
    sortable: false,
    style: 'width: 64px',
    headerStyle: 'width: 64px',
  },
  {
    name: 'trackDisplayName',
    label: 'Track name',
    field: (row: TrackSearchResult) => row.track_title,
    align: 'left',
  },
  {
    name: 'duration',
    label: 'Track duration',
    field: (row: TrackSearchResult) => row.duration_ms,
    align: 'right',
  },
];

// Converts a raw buffer into a base64-encoded image
function bufferToImage(array: Uint8Array): string {
  const base64 = Buffer.from(array).toString('base64');
  return 'data:image/jpeg;base64,' + base64;
}

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function performSearch(query: string, searchLocal: boolean) {
  if (query === '') {
    return;
  }

  searching.value = true;

  if (searchLocal) {
    tracks.value = await window.ipc.searchLocal(query);
    searchedLocal.value = true;
  } else {
    const res = await spotify.api.search(query, ['track']);
    tracks.value = res.tracks.items.map((track) =>
      spotifyTrackToSearchResult(track)
    );
    console.log(tracks.value);
    searchedLocal.value = false;
  }

  searching.value = false;
}
</script>
