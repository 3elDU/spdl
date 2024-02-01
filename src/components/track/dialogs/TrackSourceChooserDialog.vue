<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <div
      class="tw-overflow-hidden tw-bg-white dark:tw-bg-neutral-800 dark:tw-border dark:tw-border-neutral-600 tw-flex tw-flex-col tw-gap-4 tw-p-4"
    >
      <div>
        <div class="text-h6">Search results</div>
      </div>

      <div class="tw-overflow-auto">
        <div
          v-if="loading"
          class="tw-flex tw-w-full tw-h-24 tw-items-center tw-justify-center"
        >
          <q-spinner size="32px" />
        </div>
        <div v-else class="tw-min-h-16">
          <q-list separator>
            <q-item
              v-for="video in results"
              :key="video.id"
              class="video-source-item"
            >
              <q-item-section avatar>
                <img
                  class="tw-aspect-video tw-h-12 tw-rounded"
                  :src="video.thumbnail?.url"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1" v-if="video.title">{{
                  video.title
                }}</q-item-label>
                <q-item-label lines="1" v-if="video.channel" caption>{{
                  video.channel?.name
                }}</q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-item-label caption class="tw-self-center">
                  {{ video.durationFormatted }}</q-item-label
                >
                <q-item-label>
                  <q-btn dense flat round icon="more_vert">
                    <track-source-action-menu :track="track" :video="video" />
                  </q-btn>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <div class="tw-self-end">
        <q-btn color="primary" flat label="Cancel" @click="onDialogCancel" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { SPDL } from 'app/types';
import { useDialogPluginComponent } from 'quasar';
import { Ref, ref, toRaw } from 'vue';
import { Video } from 'youtube-sr';
import TrackSourceActionMenu from 'components/track/menus/TrackSourceActionMenu.vue';

const props = defineProps<{
  track: SPDL.Track;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const loading = ref(true);
const results: Ref<Video[]> = ref([]);
async function load() {
  loading.value = true;

  results.value = await window.ipc.searchYT(toRaw(props.track));

  loading.value = false;
}
load();
</script>
