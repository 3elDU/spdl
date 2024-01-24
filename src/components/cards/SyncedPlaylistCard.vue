<template>
  <q-card flat bordered class="tw-h-32 tw-box-content tw-overflow-hidden">
    <q-card-section horizontal>
      <q-avatar v-if="playlist.images.length > 0" size="128px" square>
        <img :src="playlist.images[0].url" />
      </q-avatar>
      <div
        v-else
        class="tw-w-32 tw-h-32 tw-aspect-square bg-grey-4 tw-flex tw-justify-center tw-items-center text-subtitle2"
      >
        No image
      </div>

      <q-card-section class="tw-overflow-hidden">
        <RouterLink
          v-if="playlist.name"
          class="text-h6"
          :title="playlist.name"
          :to="{
            name: 'playlist',
            params: {
              id: playlist.id,
            },
          }"
        >
          <div class="tw-truncate">
            {{ playlist.name }}
          </div>
        </RouterLink>
        <div v-else class="text-h6 tw-truncate text-grey">No name</div>

        <div
          v-if="playlist.description"
          class="text-caption tw-line-clamp-2 tw-text-ellipsis"
          :title="playlist.description"
        >
          {{ playlist.description }}
        </div>
        <div v-else class="text-caption tw-truncate text-grey">
          No description
        </div>

        <div v-if="playlist.tracks" class="text-subtitle2">
          {{ playlist.tracks.total }} Tracks
        </div>
      </q-card-section>

      <q-card-actions vertical class="tw-ml-auto">
        <q-btn
          v-if="preferences.playlistIsSynced(playlist)"
          flat
          dense
          round
          color="positive"
          title="Playlist is synced. Click to remove from synced playlists"
          @click="preferences.unsyncPlaylist(playlist)"
        >
          <q-icon name="sync" />
        </q-btn>
        <q-btn
          v-else
          flat
          dense
          round
          color="negative"
          title="Sync playlist"
          @click="preferences.syncPlaylist(playlist)"
        >
          <q-icon name="sync_disabled" />
        </q-btn>
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { usePreferencesStore } from 'src/stores/preferences';

defineProps<{
  playlist: SimplifiedPlaylist;
}>();

const preferences = usePreferencesStore();
</script>
