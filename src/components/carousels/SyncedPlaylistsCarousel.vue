<template>
  <q-carousel
    v-if="preferences.syncedPlaylists.length > 0"
    ref="carousel"
    v-model="selectedPlaylist"
    vertical
    animated
    transition-prev="slide-down"
    transition-next="slide-up"
    class="tw-flex-grow tw-h-32 tw-max-w-[40%] tw-min-w-fit"
  >
    <q-carousel-slide
      v-for="playlist in preferences.syncedPlaylists"
      :key="playlist.id"
      :name="playlist.id"
      class="tw-p-0"
    >
      <q-card flat bordered class="tw-h-32 tw-relative">
        <q-card-section horizontal>
          <img
            v-if="playlist.cover"
            :src="playlist.cover"
            class="tw-w-32 tw-h-32 tw-aspect-square"
          />
          <div
            v-else
            class="tw-w-32 tw-h-32 bg-grey-4 tw-aspect-square tw-flex tw-justify-center tw-items-center"
          >
            No image
          </div>

          <q-card-section class="tw-overflow-hidden">
            <RouterLink
              class="text-h6 tw-font-normal tw-truncate"
              :title="playlist.name"
              :to="{
                name: 'playlist',
                params: {
                  id: playlist.id,
                },
              }"
            >
              {{ playlist.name.length > 0 ? playlist.name : 'No name' }}
            </RouterLink>

            <div class="text-caption text-grey">
              {{ playlist.tracksCount }} tracks
            </div>

            <div class="text-caption text-grey tw-truncate">
              Last synced:<br />
              {{ formatDateTime(new Date(playlist.lastSynced)) }}
            </div>
          </q-card-section>

          <q-card-actions vertical class="tw-ml-auto">
            <q-btn
              dense
              flat
              round
              icon="keyboard_arrow_up"
              @click="carousel?.previous()"
            />
            <q-btn
              dense
              flat
              round
              icon="keyboard_arrow_down"
              @click="carousel?.next()"
            />
            <q-btn
              dense
              flat
              round
              icon="sync"
              color="primary"
              @click="syncPlaylist(playlist.id)"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';
import { Ref, ref } from 'vue';
import { formatDateTime } from 'src/util';
import { syncPlaylist } from 'src/sync';
import { storeToRefs } from 'pinia';
import { QCarousel } from 'quasar';

const { preferences } = storeToRefs(usePreferencesStore());
const selectedPlaylist = ref(preferences.value.syncedPlaylists.at(0)?.id);

const carousel: Ref<QCarousel | undefined> = ref(undefined);
</script>
