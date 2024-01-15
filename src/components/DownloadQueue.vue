<template>
  <div>
    <div class="row justify-between items-center">
      <div class="text-h5">Download queue</div>
      <q-input v-model="filter" label="Filter" class="tw-w-1/3"></q-input>
    </div>
  </div>

  <q-table :rows="items" :columns="columns" :filter="filter" flat>
    <template v-slot:body-cell-album="props">
      <q-td :props="props">
        <TrackAlbumCover
          size="64px"
          :track="props.row.track"
          show-play-button
        />
      </q-td>
    </template>
    <template v-slot:body-cell-progress="props">
      <q-td
        :props="props"
        @mouseenter="showDownloadNowButton = true"
        @mouseleave="showDownloadNowButton = false"
      >
        <div class="tw-inline-flex tw-gap-2 items-center">
          <TrackDownloadProgress :track="props.row" />
          <q-btn
            v-if="showDownloadNowButton && props.row.status === 'pending'"
            dense
            flat
            round
            color="primary"
            icon="download"
            title="Download now"
            @click="downloadNow(props.row)"
          />
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <q-item class="tw-p-0">
          <q-item-section>
            <q-item-label>{{ props.row.track.name }}</q-item-label>
            <q-item-label caption>{{
              formatTrackAuthors(props.row.track)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-td>
    </template>
    <template v-slot:no-data>
      <div class="tw-flex tw-flex-row tw-items-center tw-gap-2">
        <q-icon name="o_info" size="sm" color="grey" />
        No tracks are currently downloading
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar';
import TrackDownloadProgress from './track/TrackDownloadProgress.vue';
import { useQueueStore } from 'src/stores/queue';
import { ref, toRaw } from 'vue';
import { formatTrackAuthors, formatTrackDuration } from 'src/util';
import { storeToRefs } from 'pinia';
import { SPDL } from 'app/types';
import TrackAlbumCover from './track/TrackAlbumCover.vue';

const showDownloadNowButton = ref(false);
function downloadNow(queueItem: SPDL.Queue.Item) {
  window.ipc.downloadTrack(toRaw(queueItem.track), false);
}

const filter = ref('');
const columns: QTableColumn[] = [
  {
    name: 'album',
    align: 'left',
    field: (row: SPDL.Queue.Item) => row.track.album.cover_url,
    label: 'Album cover',
    sortable: false,
    style: 'width: 64px',
  },
  {
    name: 'progress',
    align: 'left',
    field: 'progress',
    sortable: true,
    label: 'Download progress',
  },
  {
    name: 'name',
    align: 'left',
    field: (row: SPDL.Queue.Item) => row.track.name,
    label: 'Name',
    format: (val, row) => `${row.author} — ${val}`,
    sortable: true,
  },
  {
    name: 'duration',
    align: 'right',
    field: (row: SPDL.Queue.Item) => row.track.duration,
    label: 'Duration',
    format: (val: number) => formatTrackDuration(val),
    sortable: true,
  },
];

const queue = useQueueStore();
const { items } = storeToRefs(queue);
</script>
