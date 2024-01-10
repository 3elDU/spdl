<template>
  <q-page
    v-if="loading"
    padding
    class="tw-grid tw-auto-rows-max tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-gap-4"
  >
    <q-card
      v-for="index in 20"
      :key="index"
      flat
      bordered
      class="tw-h-32 tw-box-content"
    >
      <q-card-section horizontal>
        <q-skeleton
          size="128px"
          class="tw-w-32 tw-h-32 tw-aspect-square"
          square
          type="QAvatar"
        />

        <q-card-section>
          <q-skeleton type="text" width="100px" height="48px" />
          <q-skeleton type="text" width="150px" />
          <q-skeleton type="text" width="140px" />
        </q-card-section>

        <q-card-actions vertical class="tw-ml-auto">
          <q-skeleton type="QBtn" size="32px" class="tw-rounded-full" />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-page>
  <q-page
    v-else
    padding
    class="tw-grid tw-auto-rows-max tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-gap-4"
  >
    <q-card flat bordered class="tw-h-32 tw-box-content">
      <q-card-section horizontal>
        <q-avatar square size="128px" color="primary" text-color="white">
          <q-icon name="favorite" size="64px" />
        </q-avatar>

        <q-card-section class="tw-overflow-hidden">
          <div class="text-h6 tw-truncate">Liked songs</div>
          <div class="text-subtitle2">{{ likedTracksCount }} Tracks</div>
        </q-card-section>

        <q-card-actions vertical class="tw-ml-auto">
          <q-btn
            v-if="preferences.syncedLikedTracks.synced"
            color="positive"
            dense
            flat
            round
            aria-label="Liked tracks are synced. Click to turn off sync"
            @click="unsyncLikedTracks"
          >
            <q-icon name="sync" />
          </q-btn>
          <q-btn
            v-else
            color="negative"
            dense
            flat
            round
            aria-label="Sync liked tracks"
            @click="turnOnLikedTracksSync"
          >
            <q-icon name="sync_disabled" />
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>

    <q-card
      flat
      bordered
      v-for="playlist of playlists"
      :key="playlist.id"
      class="tw-h-32 tw-box-content tw-overflow-hidden"
    >
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
          <div
            v-if="playlist.name"
            class="text-h6 tw-truncate tw-cursor-pointer"
            :title="playlist.name"
            @click="openPlaylist(playlist)"
          >
            {{ playlist.name }}
          </div>
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
            v-if="
              preferences.syncedPlaylists.find(
                (item) => item.id === playlist.id
              )
            "
            flat
            dense
            round
            color="positive"
            title="Playlist is synced. Click to remove from synced playlists"
            @click="removeFromSyncedPlaylists(playlist)"
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
            @click="addToSyncedPlaylists(playlist)"
          >
            <q-icon name="sync_disabled" />
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { storeToRefs } from 'pinia';
import { usePreferencesStore } from 'src/stores/preferences';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { syncPlaylist, syncLikedTracks } from 'src/sync/sync';
import { ref, Ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const spotify = useSpotifyAPIStore();
const { preferences } = storeToRefs(usePreferencesStore());
const loading = ref(true);
const likedTracksCount: Ref<number> = ref(0);
const playlists: Ref<SimplifiedPlaylist[]> = ref([]);

async function load() {
  likedTracksCount.value = (
    await spotify.api.currentUser.tracks.savedTracks(1)
  ).total;
  playlists.value = (
    await spotify.api.currentUser.playlists.playlists(50)
  ).items;
  loading.value = false;
}

load();

function openPlaylist(playlist: SimplifiedPlaylist) {
  router.push({
    name: 'tracklist',
    params: {
      type: 'playlist',
      id: playlist.id,
    },
  });
}

function addToSyncedPlaylists(playlist: SimplifiedPlaylist) {
  preferences.value.syncedPlaylists.push({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover: playlist.images.at(0)?.url,
    tracksCount: playlist.tracks?.total ?? 0,
    lastSynced: 0,
  });
  syncPlaylist(playlist.id);
}

function removeFromSyncedPlaylists(playlist: SimplifiedPlaylist) {
  const idx = preferences.value.syncedPlaylists.findIndex(
    (value) => value.id === playlist.id
  );
  if (idx !== -1) {
    preferences.value.syncedPlaylists.splice(idx, 1);
  }
}

function turnOnLikedTracksSync() {
  preferences.value.syncedLikedTracks = {
    synced: true,
    lastSynced: 0,
    tracksCount: likedTracksCount.value,
  };
  syncLikedTracks();
}

function unsyncLikedTracks() {
  preferences.value.syncedLikedTracks.synced = false;
}
</script>
