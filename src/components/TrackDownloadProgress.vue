<template>
  <q-icon
    v-if="queueItem?.status === 'pending'"
    class="tw-p-[5px]"
    name="pending"
    size="sm"
    color="grey"
    title="Pending"
  />
  <q-circular-progress
    v-else-if="queueItem?.status === 'downloading'"
    :value="queueItem.progress"
    class="tw-m-[5px]"
    size="sm"
    track-color="grey-3"
    :title="queueItem.progress.toString() + '%'"
  />
  <q-icon
    v-else-if="queueItem?.status === 'error'"
    class="tw-p-[5px]"
    name="error"
    size="sm"
    color="negative"
  >
    <q-tooltip>
      {{ queueItem?.error }}
    </q-tooltip>
  </q-icon>
  <q-icon
    v-else-if="queueItem?.status === 'success' || trackExistsOnDisk"
    class="tw-p-[5px]"
    name="check_circle"
    size="sm"
    color="positive"
  >
    <q-tooltip v-if="queueItem?.tooltip" class="tw-whitespace-pre-wrap">
      {{ queueItem.tooltip }}
    </q-tooltip>
  </q-icon>
  <q-btn
    v-else-if="showDownloadButton"
    dense
    flat
    round
    color="primary"
    icon="download"
    @click="download"
  />
</template>

<script setup lang="ts">
import { Track } from '@spotify/web-api-ts-sdk';
import { useQueueStore } from 'src/stores/queue';
import { ComputedRef, Ref, computed, ref, toRaw, watch } from 'vue';

const { track, showDownloadButton } = defineProps<{
  track: Track;
  showDownloadButton?: boolean;
}>();

const downloading = ref(false);
function download() {
  window.ipc.downloadTrack(toRaw(track));
  downloading.value = true;
}

const queue = useQueueStore();
let queueItem: ComputedRef<QueueItem | undefined> | Ref<QueueItem | undefined> =
  computed(() => queue.items.find((value) => value.id === track.id));

watch(queueItem, (newQueueItem, oldQueueItem) => {
  // If the queue item became undefined (was removed from the queue),
  // preserve the previous value of it
  if (newQueueItem === undefined) {
    queueItem = ref(oldQueueItem);
  }
});

const trackExistsOnDisk = ref(false);
// Check if the track already exists in the queue
if (queueItem.value !== undefined) {
  downloading.value = true;
} else {
  // Or, if it exists on the disk
  window.ipc.trackExistsOnDisk(toRaw(track)).then((exists) => {
    trackExistsOnDisk.value = exists;
  });
}
</script>
