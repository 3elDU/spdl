<template>
  <q-dialog v-model="dialog">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Parallel downloading</div>
      </q-card-section>

      <q-card-section class="tw-pt-0">
        <q-input
          class="tw-w-80"
          type="number"
          :rules="[
            (val) =>
              Number.parseInt(val) >= 1 ||
              'Number of threads must be greater or equal than 1',
          ]"
          label="N of threads for parallel downloading"
          v-model.number="limit"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          label="Set"
          @click="setParallelDownloadingLimit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';
import { ref } from 'vue';

const dialog = defineModel<boolean>();
const preferences = usePreferencesStore();

const limit = ref(preferences.preferences.parallelDownloadingLimit);

async function setParallelDownloadingLimit() {
  if (Number.isFinite(dialog.value)) {
    preferences.preferences.parallelDownloadingLimit = limit.value;
    await window.ipc.relaunch();
  }
}
</script>
