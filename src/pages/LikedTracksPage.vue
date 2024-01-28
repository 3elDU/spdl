<template>
  <q-page>
    <q-table
      v-if="tracks.length > 0"
      flat
      :rows="tracks"
      :columns="columns"
      :loading="loading"
      row-key="id"
      class="tracklist-table tw-size-full tw-relative"
      table-style="height: 100%; scroll-margin-top: 48px"
      virtual-scroll
      hide-pagination
      :virtual-scroll-item-size="64"
      :virtual-scroll-sticky-size-start="48"
      @virtual-scroll="scroll($event)"
      v-model:pagination="pagination"
      @request="request"
    >
      <template v-slot:loading>
        <q-linear-progress
          indeterminate
          class="tw-absolute tw-top-11 tw-z-10 !tw-rounded-none"
        />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th :props="props" key="index" class="tw-w-1"> # </q-th>
          <q-th :props="props" key="title" class="tw-w-[50%]"> Title </q-th>
          <q-th :props="props" key="album" class="tw-w-[30%]"> Album </q-th>
          <q-th :props="props" key="duration" class="tw-w-1"> Duration </q-th>
          <q-th :props="props" key="download" class="tw-w-1" />
        </q-tr>
      </template>

      <template v-slot:body-cell-index="props">
        <q-td :props="props">
          <DynamicTrackIndex
            :track="props.row"
            :index="props.rowIndex"
            class="tw-p-0"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <TrackItem show-album-cover :track="props.row" class="tw-p-0" />
        </q-td>
      </template>

      <template v-slot:body-cell-album="props">
        <q-td :props="props">
          <TrackAlbum :album="props.row.album" />
        </q-td>
      </template>

      <template v-slot:body-cell-duration="props">
        <q-td :props="props">
          {{ formatTrackDuration(props.row.duration) }}
        </q-td>
      </template>

      <template v-slot:body-cell-download="props">
        <q-td :props="props">
          <TrackDownloadProgress :track="props.row" show-download-button />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<style>
.tracklist-table {
  & .q-table {
    @apply tw-table-fixed;
  }
  & tr {
    @apply tw-h-16;
  }
  /* Make table header sticky */
  & thead {
    @apply tw-sticky tw-top-0 tw-z-10 tw-bg-neutral-100 dark:tw-bg-neutral-700;
  }

  & tbody {
    @apply tw-scroll-mt-12;
  }
}
</style>

<script setup lang="ts">
import { Page, SavedTrack } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import { QTableColumn } from 'quasar';
import TrackAlbum from 'src/components/links/TrackAlbum.vue';
import DynamicTrackIndex from 'src/components/track/DynamicTrackIndex.vue';
import TrackDownloadProgress from 'src/components/track/TrackDownloadProgress.vue';
import TrackItem from 'src/components/track/TrackItem.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { formatTrackDuration, transformNextURL } from 'src/util';
import { Component, Ref, ref } from 'vue';

const spotify = useSpotifyAPIStore();

const loading = ref(true);

const pagination: Ref<{
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}> = ref({
  sortBy: '',
  descending: false,
  page: 0,
  rowsPerPage: 0,
  rowsNumber: 0,
});

const columns: QTableColumn[] = [
  {
    name: 'index',
    label: '#',
    field: 'id',
    align: 'center',
  },
  {
    name: 'title',
    label: 'Title',
    field: 'name',
    align: 'left',
    sortable: true,
    style: 'width: 50px',
  },
  {
    name: 'album',
    label: 'Album',
    field: (row: SPDL.Track) => row.album.name,
    align: 'left',
    sortable: true,
  },
  {
    name: 'duration',
    label: 'Duration',
    field: 'duration',
    align: 'right',
    sortable: true,
  },
  {
    name: 'download',
    label: 'Download',
    field: 'track_number',
    align: 'right',
  },
];

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

async function fetchAll() {
  if (!next) {
    return;
  }

  let offsets = [];
  for (let i = 0; i <= favourites.value!.total; i += 50) {
    offsets.push(i);
  }

  tracks.value = (
    await Promise.all(
      offsets.map((offset) =>
        spotify.api.currentUser.tracks.savedTracks(50, offset)
      )
    )
  )
    .map((page) => page.items)
    .flat()
    .map((item) => fromSpotifyTrack(item.track));

  next = null;
}

async function scroll(event: {
  index: number;
  from: number;
  to: number;
  direction: 'increase' | 'decrease';
  ref: Component;
}) {
  // Fetch new tracks when scrolled to an end
  if (event.index >= tracks.value.length - 1 && next) {
    loading.value = true;

    const _tracks = await spotify.api.makeRequest<Page<SavedTrack>>(
      'GET',
      transformNextURL(next)
    );
    next = _tracks.next;

    tracks.value.push(
      ..._tracks.items.map((item) => fromSpotifyTrack(item.track))
    );

    loading.value = false;
  }
}

function sort() {
  switch (pagination.value.sortBy) {
    case 'duration':
      tracks.value.sort(
        (a, b) => (a.duration as number) - (b.duration as number)
      );
      break;
    case 'title':
      tracks.value.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'album':
      tracks.value.sort((a, b) => a.album.name.localeCompare(b.album.name));
      break;
  }

  if (pagination.value.descending) {
    tracks.value.reverse();
  }
}

async function request(props: {
  pagination: {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
  };
  filter?: unknown;
}) {
  if (loading.value) {
    return;
  }

  loading.value = true;

  if (tracks.value.length !== favourites.value?.total) {
    await fetchAll();
  }

  pagination.value = {
    ...pagination.value,
    ...props.pagination,
  };

  if (props.pagination.sortBy) {
    sort();
  }

  loading.value = false;
}
</script>
