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
        <q-avatar size="64px" rounded>
          <q-img :src="props.value" />
        </q-avatar>
      </q-td>
    </template>
    <template v-slot:body-cell-progress="props">
      <q-td :props="props">
        <div class="tw-inline-flex tw-gap-2 items-center">
          <TrackDownloadProgress :track="props.row" />
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
        <q-icon name="o_info" size="sm" />
        No tracks are currently downloading
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar';
import TrackDownloadProgress from './TrackDownloadProgress.vue';
import { useQueueStore } from 'src/stores/queue';
import { ref } from 'vue';
import { formatTrackAuthors, formatTrackDuration } from 'src/util/util';
import { storeToRefs } from 'pinia';

const filter = ref('');
const columns: QTableColumn[] = [
  {
    name: 'album',
    align: 'left',
    field: (row: QueueItem) => row.track.album.images[0].url,
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
    field: (row: QueueItem) => row.track.name,
    label: 'Name',
    format: (val, row) => `${row.author} — ${val}`,
    sortable: true,
  },
  {
    name: 'duration',
    align: 'right',
    field: (row: QueueItem) => row.track.duration_ms,
    label: 'Duration',
    format: (val: number) => formatTrackDuration(val),
    sortable: true,
  },
];

const queue = useQueueStore();
const { items } = storeToRefs(queue);
</script>
