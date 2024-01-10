<template>
  <!-- A page for displaying a list of tracks, such as a playlist or an album -->
  <div class="tw-w-full tw-flex tw-flex-col tw-justify-center tw-items-center">
    <div
      class="tw-w-full tw-px-36 tw-py-16 tw-flex tw-flex-wrap tw-justify-center tw-gap-8 bg-grey-2"
    >
      <q-skeleton v-if="loading" size="192px" square class="tw-rounded-md" />
      <q-avatar v-else size="192px" rounded class="shadow-5">
        <img :src="playlistOrAlbum?.images.at(0)?.url" />
      </q-avatar>

      <div v-if="loading">
        <q-skeleton type="text" width="8rem" />
        <q-skeleton type="text" width="20rem" height="6rem" />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
      </div>
      <div v-else>
        <div class="text-overline text-uppercase">{{ type }}</div>
        <div class="text-h3" :title="playlistOrAlbum?.name">
          {{ playlistOrAlbum?.name }}
        </div>
        <div
          v-if="playlistOrAlbum?.type === 'playlist'"
          class="text-subtitle1 tw-line-clamp-4"
          :title="(playlistOrAlbum as Playlist).description"
        >
          {{ (playlistOrAlbum as Playlist).description }}
        </div>
        <div v-if="playlistOrAlbum?.type === 'album'">
          {{
            (playlistOrAlbum as Album).artists
              .map((artist) => artist.name)
              .join(', ')
          }}
        </div>
      </div>
    </div>

    <q-separator class="tw-w-full" />

    <q-list v-if="loading" class="tw-p-8 tw-self-start tw-w-full">
      <q-item v-for="index in 20" :key="index">
        <q-item-section
          side
          class="tw-w-[4rem] tw-flex tw-justify-center tw-items-center"
        >
          <q-skeleton type="text" width="1em" />
        </q-item-section>

        <q-item-section avatar v-if="type === 'playlist'">
          <q-skeleton type="QAvatar" square class="tw-rounded" size="40px" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" width="12em" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton type="text" width="8em" />
          </q-item-label>
        </q-item-section>

        <q-item-section v-if="type === 'playlist'">
          <q-skeleton type="text" width="20em" />
        </q-item-section>

        <q-item-section side>
          <q-skeleton type="text" width="3rem" />
        </q-item-section>
        <q-item-section side>
          <q-skeleton size="24px" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else class="tw-p-8 tw-self-start tw-w-full">
      <q-item v-for="(track, idx) in tracks" :key="track.id">
        <DynamicTrackIndex :index="idx" :track="track" />

        <q-item-section avatar v-if="type === 'playlist'">
          <TrackAlbumCover :track="track" show-play-button />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            {{ track.name }}
          </q-item-label>
          <q-item-label caption>
            {{ formatTrackAuthors(track) }}
          </q-item-label>
        </q-item-section>

        <q-item-section
          v-if="type === 'playlist'"
          class="tw-cursor-pointer"
          @click="goToTrackAlbum(track)"
        >
          {{ track.album.name }}
        </q-item-section>

        <q-item-section side>
          {{ formatTrackDuration(track.duration) }}
        </q-item-section>
        <q-item-section side>
          <TrackDownloadProgress show-download-button :track="track" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { Album, Playlist, Track } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import DynamicTrackIndex from 'src/components/DynamicTrackIndex.vue';
import TrackAlbumCover from 'src/components/TrackAlbumCover.vue';
import TrackDownloadProgress from 'src/components/TrackDownloadProgress.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { formatTrackAuthors, formatTrackDuration } from 'src/util/util';
import { Ref, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
  type: 'playlist' | 'album';
  id: string;
}>();

// Refetch tracks when props change
watch(props, () => {
  loadTracks();
});

const loading = ref(true);
// Playlist or album item, to access it's name, description and cover image
const playlistOrAlbum: Ref<Playlist | Album | undefined> = ref(undefined);
const tracks: Ref<SPDL.Track[]> = ref([]);

const spotify = useSpotifyAPIStore();
async function loadTracks() {
  loading.value = true;

  let items: SPDL.Track[];
  if (props.type === 'playlist') {
    const playlist = await spotify.api.playlists.getPlaylist(
      props.id as string
    );
    playlistOrAlbum.value = playlist;
    items = playlist.tracks.items
      .filter((item) => item.track.type == 'track')
      .map((item) => fromSpotifyTrack(item.track as Track));
  } else {
    const album = await spotify.api.albums.get(props.id as string, undefined);
    playlistOrAlbum.value = album;
    items = album.tracks.items.map((item) => {
      // SimplifiedTrack type is missing the 'album' property, but it is required
      // in the convertation process, so we assign it
      item = Object.assign(item, {
        album,
      });
      return fromSpotifyTrack(item as Track);
    });
  }

  tracks.value = items;
  loading.value = false;
}
loadTracks();

async function goToTrackAlbum(track: SPDL.Track) {
  await router.push({
    name: 'tracklist',
    params: {
      type: 'album',
      id: track.album.id,
    },
  });
}
</script>
