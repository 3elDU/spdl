<template>
  <q-dialog v-model="dialog">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Choose music directory</div>
      </q-card-section>

      <q-card-section class="tw-pt-0">
        <q-select
          class="tw-w-80"
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
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          icon="open_in_new"
          flat
          color="primary"
          label="Open folder"
          @click="openMusicDirectory"
        />

        <q-btn flat color="primary" label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { usePreferencesStore } from 'src/stores/preferences';

const dialog = defineModel<boolean>();

const preferences = usePreferencesStore();

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

const openMusicDirectory = () => window.ipc.openMusicDirectory();

function deletePreviouslySelectedFolder(folder: string) {
  const id = preferences.preferences.previousMusicDirectories.indexOf(folder);
  preferences.preferences.previousMusicDirectories.splice(id, 1);
}
</script>
