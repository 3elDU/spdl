<template>
  <q-table
    v-if="tracks.length > 0"
    flat
    :rows="tracks"
    :columns="columns"
    :loading="loading"
    row-key="id"
    class="tracklist-table tw-size-full"
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
      <tr v-if="$slots.header">
        <th colspan="5" class="!tw-p-0">
          <slot name="header" />
        </th>
      </tr>
      <q-tr v-if="!hideTableHeader" :props="props" class="table-header">
        <q-th :props="props" key="index"> # </q-th>
        <q-th :props="props" key="title" class="track-header"> Title </q-th>
        <q-th :props="props" key="album" class="album-header"> Album </q-th>
        <q-th :props="props" key="duration"> Duration </q-th>
        <q-th :props="props" key="download" />
      </q-tr>
    </template>

    <template v-slot:body-cell-index="props">
      <q-td :props="props" class="tw-max-w-min">
        <DynamicTrackIndex
          :track="props.row"
          :index="props.rowIndex"
          class="tw-p-0"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-title="props">
      <q-td :props="props" class="tw-w-1/2 tw-max-w-1">
        <TrackItem show-album-cover :track="props.row" class="tw-p-0" />
      </q-td>
    </template>

    <template v-slot:body-cell-album="props">
      <q-td :props="props" class="album-row tw-max-w-1 tw-w-[30%]">
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
</template>

<style>
.tracklist-table {
  & tr {
    @apply tw-h-16 tw-overflow-x-clip;
    content-visibility: auto;
    contain-intrinsic-size: auto 64px;

    /* Override default border color to be more dim in dark mode */
    & > :is(td.q-td, th) {
      @apply dark:tw-border-neutral-700;
    }
  }

  & thead {
    @apply tw-bg-neutral-100 dark:tw-bg-neutral-800 tw-text-left;

    /* Make table header sticky */
    & .table-header {
      @apply tw-bg-inherit tw-h-12 tw-sticky tw-top-0 tw-z-10;
    }
  }

  & tbody {
    @apply tw-scroll-mt-12;
  }
}

@media (max-width: 960px) {
  .tracklist-table {
    .album-header,
    .album-row {
      display: none;
    }
    .track-header {
      width: 100%;
    }
  }
}
</style>

<script setup lang="ts">
import { SPDL } from 'app/types';
import TrackAlbum from 'components/links/TrackAlbum.vue';
import DynamicTrackIndex from 'components/track/DynamicTrackIndex.vue';
import TrackDownloadProgress from 'components/track/TrackDownloadProgress.vue';
import TrackItem from 'components/track/TrackItem.vue';
import { QTableColumn } from 'quasar';
import { formatTrackDuration } from 'src/util';
import { Component, Ref, ref } from 'vue';

const props = defineProps<{
  hideTableHeader?: boolean;
  fetchMore?: () => Promise<void>;
  fetchAll?: () => Promise<void>;
}>();
const loading = defineModel<boolean>('loading', { default: false });
const tracks = defineModel<SPDL.Track[]>({ required: true });

defineSlots<{
  header(): unknown;
}>();

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

async function scroll(event: {
  index: number;
  from: number;
  to: number;
  direction: 'increase' | 'decrease';
  ref: Component;
}) {
  // Fetch new tracks when scrolled to an end
  if (event.index >= tracks.value.length - 1 && props.fetchMore) {
    loading.value = true;
    console.log('calling fetchMore()');
    await props.fetchMore();
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

async function request(requestProps: {
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

  if (props.fetchAll) {
    console.log('calling fetchAll()');
    await props.fetchAll();
  }

  pagination.value = {
    ...pagination.value,
    ...requestProps.pagination,
  };

  if (requestProps.pagination.sortBy) {
    sort();
  }

  loading.value = false;
}
</script>
