<template>
  <q-page
    class="tw-w-full tw-flex tw-flex-col tw-justify-start tw-items-center"
  >
    <q-virtual-scroll
      class="tw-w-full tw-h-full tw-pb-8"
      :items="tracks"
      virtual-scroll-item-size="56"
    >
      <template #before>
        <BigAlbumOrPlaylistCard
          class="tw-mb-8"
          :loading="loading"
          type="playlist"
          :item="playlist"
        />
      </template>

      <template #default="{ item, index }">
        <TrackItem
          class="tw-px-8 tw-h-14"
          :track="item"
          :index="index"
          show-album-cover
          show-album-name
          show-duration
          show-download-button
        />
      </template>
    </q-virtual-scroll>
  </q-page>
</template>

<script setup lang="ts">
import BigAlbumOrPlaylistCard from 'components/cards/BigAlbumOrPlaylistCard.vue';
import TrackItem from 'components/track/TrackItem.vue';
import { Playlist, PlaylistedTrack, Track } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { Ref, ShallowRef, ref, shallowRef, watch } from 'vue';

const props = defineProps<{
  id: string;
}>();

// Refetch data when props change
watch(props, () => load());

const loading: Ref<boolean> = ref(true);
const playlist: Ref<Playlist | undefined> = ref(undefined);
let tracks: ShallowRef<SPDL.Track[]> = shallowRef([]);

const spotify = useSpotifyAPIStore();
async function load() {
  loading.value = true;

  playlist.value = await spotify.api.playlists.getPlaylist(props.id);
  const _tracks = await spotify.api.playlists.getPlaylistItems(props.id);

  tracks.value = [
    ..._tracks.items
      .filter((item) => item.track.type === 'track')
      .map((item) => fromSpotifyTrack(item.track as Track)),
  ];

  if (_tracks.next) {
    tracks.value = [
      ...tracks.value,

      ...(
        await spotify.fetchAllPaginated<PlaylistedTrack>(
          _tracks.next,
          _tracks.total
        )
      )
        .filter((item) => item.track.type === 'track')
        .map((item) => fromSpotifyTrack(item.track as Track)),
    ];
  }

  loading.value = false;
}
load();
</script>
