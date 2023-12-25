<template>
  <q-page padding class="q-gutter-md">
    <div class="tw-flex tw-gap-4 tw-items-center">
      <q-select
        outlined
        class="tw-flex-grow tw-max-w-xs"
        label="Base directory for saving music"
        :options="availableMusicDirectories"
        :model-value="preferences.preferences.musicDirectory"
        @update:model-value="
          (value) => {
            Notify.create({
              type: 'positive',
              message: 'Preferences saved',
            });
            preferences.changeMusicFolder(value);
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
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { usePreferencesStore } from 'src/stores/preferences';
import { computed } from 'vue';

const preferences = usePreferencesStore();

const availableMusicDirectories = computed(() =>
  [preferences.preferences.musicDirectory].concat(
    preferences.preferences.previousMusicDirectories
  )
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

function deletePreviouslySelectedFolder(folder: string) {
  const id = preferences.preferences.previousMusicDirectories.indexOf(folder);
  preferences.preferences.previousMusicDirectories.splice(id, 1);
}

const openMusicDirectory = () => window.ipc.openMusicDirectory();
</script>
