<template>
  <q-page padding class="column q-px-xl q-gutter-xl">
    <SearchComponent
      :initial-query="query"
      :initial-search-local-option="searchLocal"
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
          <q-avatar size="64px" rounded>
            <q-img :src="props.value" />
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-trackDisplayName="props">
        <q-td :props="props">
          <q-item>
            <q-item-section>
              <q-item-label>{{ props.value }}</q-item-label>
              <q-item-label caption>{{
                formatTrackAuthors(props.row)
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template v-slot:body-cell-duration="props">
        <q-td :props="props">
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
import { Track } from '@spotify/web-api-ts-sdk';
import { QTableColumn } from 'quasar';
import SearchComponent from 'src/components/SearchComponent.vue';
import TrackDownloadProgress from 'src/components/TrackDownloadProgress.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { formatTrackDuration, formatTrackAuthors } from 'src/util/util';
import { Ref, ref } from 'vue';

const tracks: Ref<Track[]> = ref([]);

const columns: QTableColumn[] = [
  {
    name: 'albumURL',
    label: 'Album cover',
    field: (row: Track) => row.album.images.at(0)?.url,
    align: 'left',
    sortable: false,
    style: 'width: 64px',
    headerStyle: 'width: 64px',
  },
  {
    name: 'trackDisplayName',
    label: 'Track name',
    field: (row: Track) => row.name,
    align: 'left',
  },
  {
    name: 'duration',
    label: 'Track duration',
    field: (row: Track) => row.duration_ms,
    align: 'right',
  },
];

const spotify = useSpotifyAPIStore();

const { query, searchLocal } = withDefaults(
  defineProps<{
    query?: string;
    searchLocal?: boolean;
  }>(),
  {
    query: '',
    searchLocal: false,
  }
);

const searching = ref(false);

if (query !== '') {
  performSearch(query, searchLocal);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function performSearch(query: string, _searchLocal: boolean) {
  if (query === '') {
    return;
  }

  searching.value = true;
  const res = await spotify.api.search(query, ['track']);
  tracks.value = res.tracks.items;
  searching.value = false;
}
</script>
