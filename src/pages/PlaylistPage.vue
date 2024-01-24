<template>
  <q-page
    class="tw-w-full tw-flex tw-flex-col tw-justify-start tw-items-center"
  >
    <BigAlbumOrPlaylistCard
      :loading="loading"
      type="playlist"
      :item="playlist"
    />

    <q-list v-if="!loading" class="tw-w-full tw-p-8">
      <q-intersection
        v-for="(track, idx) in tracks"
        :key="track.id"
        class="tw-h-14"
      >
        <TrackItem
          :track="track"
          :index="idx"
          show-album-cover
          show-album-name
          show-duration
          show-download-button
        />
      </q-intersection>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import BigAlbumOrPlaylistCard from 'components/cards/BigAlbumOrPlaylistCard.vue';
import TrackItem from 'components/track/TrackItem.vue';
import { Playlist, PlaylistedTrack, Track } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { Ref, ref, watch } from 'vue';
import { collectGenerator } from 'src/util';

const props = defineProps<{
  id: string;
}>();

// Refetch data when props change
watch(props, () => load());

const loading: Ref<boolean> = ref(true);
const playlist: Ref<Playlist | undefined> = ref(undefined);
const tracks: Ref<SPDL.Track[]> = ref([]);

const spotify = useSpotifyAPIStore();
async function load() {
  loading.value = true;

  tracks.value = [];

  playlist.value = await spotify.api.playlists.getPlaylist(props.id);

  loading.value = false;

  const _tracks = await spotify.api.playlists.getPlaylistItems(props.id);

  tracks.value.push(
    ..._tracks.items
      .filter((item) => item.track.type === 'track')
      .map((item) => fromSpotifyTrack(item.track as Track)),

    ...(
      await collectGenerator(spotify.fetchNext<PlaylistedTrack>(_tracks.next))
    )
      .filter((item) => item.track.type === 'track')
      .map((item) => fromSpotifyTrack(item.track as Track))
  );
}
load();
</script>
