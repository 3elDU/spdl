<template>
  <!-- A page for displaying a list of tracks, such as a playlist or an album -->
  <div class="tw-w-full tw-flex tw-flex-col tw-justify-center tw-items-center">
    <div class="tw-w-full tw-px-36 tw-py-16 bg-grey-2">
      <BigAlbumOrPlaylistCard
        :loading="loading"
        :type="type"
        :item="playlistOrAlbum"
      />
    </div>

    <q-separator class="tw-w-full" />

    <q-list v-if="playlistOrAlbum" class="tw-p-8 tw-self-start tw-w-full">
      <TrackItem
        v-for="(track, idx) in tracks"
        :key="track.id"
        :track="track"
        :index="idx"
        :show-album-cover="type === 'playlist'"
        show-album-name
        show-duration
        show-download-button
      />
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { Album, Playlist, Track } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import BigAlbumOrPlaylistCard from 'src/components/cards/BigAlbumOrPlaylistCard.vue';
import TrackItem from 'src/components/track/TrackItem.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { Ref, ref, watch } from 'vue';

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
</script>
