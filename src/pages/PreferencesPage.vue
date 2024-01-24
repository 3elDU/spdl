<template>
  <q-page padding class="tw-flex tw-flex-col tw-gap-4">
    <div class="tw-flex tw-gap-4 tw-items-center">
      <q-select
        outlined
        class="tw-flex-grow tw-max-w-xs"
        label="Base directory for saving music"
        :options="preferences.availableMusicDirectories"
        :model-value="preferences.preferences.musicDirectory"
        @update:model-value="
          (value) => {
            preferences.changeMusicFolder(value);
            Notify.create({
              type: 'positive',
              message: 'Preferences saved',
            });
          }
        "
      >
        <template v-slot:prepend>
          <q-icon name="folder" />
        </template>
        <template v-slot:option="scope">
          <div class="tw-flex tw-items-center">
            <q-item class="tw-flex-grow" v-bind="scope.itemProps">
              <q-item-section>{{ scope.opt }}</q-item-section>
            </q-item>
            <q-btn
              v-if="!scope.selected"
              color="negative"
              icon="delete"
              flat
              class="tw-h-12"
              aria-label="Delete this entry"
              @click="deletePreviouslySelectedFolder(scope.opt)"
            />
          </div>
        </template>
        <template v-slot:after-options>
          <q-item clickable @click="chooseMusicFolder">
            <q-item-section avatar>
              <q-icon name="launch" />
            </q-item-section>
            <q-item-section> Choose different folder </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-btn
        icon="open_in_new"
        rounded
        flat
        color="primary"
        label="Open folder"
        @click="openMusicDirectory"
      />
    </div>

    <div class="tw-flex tw-gap-4 tw-items-center">
      <q-input
        outlined
        class="tw-max-w-xs tw-grow"
        type="number"
        :rules="[
          (val) =>
            Number.parseInt(val) >= 1 ||
            'Number of threads must be greater or equal than 1',
        ]"
        label="N of threads for parallel downloading"
        v-model.number="parallelDownloadingLimit"
      />

      <q-btn color="primary" label="Set" @click="setParallelDownloadingLimit" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { usePreferencesStore } from 'src/stores/preferences';
import { ref } from 'vue';

const preferences = usePreferencesStore();
const parallelDownloadingLimit = ref(
  preferences.preferences.parallelDownloadingLimit
);

async function chooseMusicFolder() {
  const newFolder = await window.ipc.chooseMusicDirectory();
  if (newFolder !== undefined) {
    preferences.changeMusicFolder(newFolder);
    Notify.create({
      type: 'positive',
      message: 'Preferences saved',
    });
  }
}

function setParallelDownloadingLimit() {
  if (
    typeof parallelDownloadingLimit.value === 'number' &&
    !Number.isNaN(parallelDownloadingLimit.value)
  ) {
    preferences.preferences.parallelDownloadingLimit =
      parallelDownloadingLimit.value;
    window.ipc.relaunch();
  }
}

function deletePreviouslySelectedFolder(folder: string) {
  const id = preferences.preferences.previousMusicDirectories.indexOf(folder);
  preferences.preferences.previousMusicDirectories.splice(id, 1);
}

const openMusicDirectory = () => window.ipc.openMusicDirectory();
</script>
