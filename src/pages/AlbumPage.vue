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
          :loading="loading"
          type="album"
          :item="album"
          class="tw-mb-8"
        />
      </template>
      <template #default="{ item, index }">
        <TrackItem
          class="tw-px-8 tw-h-14"
          :track="item"
          :index="index"
          show-duration
          show-download-button
        />
      </template>
    </q-virtual-scroll>
  </q-page>
</template>

<script setup lang="ts">
import { Album, SimplifiedTrack } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import TrackItem from 'src/components/track/TrackItem.vue';
import { fromSimplifiedSpotifyTrack } from 'app/types/convert';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { ref, Ref, ShallowRef, shallowRef, watch } from 'vue';
import BigAlbumOrPlaylistCard from 'src/components/cards/BigAlbumOrPlaylistCard.vue';

const props = defineProps<{
  id: string;
}>();

// Re-fetch data, when props change
watch(props, () => {
  load();
});

const loading: Ref<boolean> = ref(true);
const album: Ref<Album | undefined> = ref(undefined);
let tracks: ShallowRef<SPDL.Track[]> = shallowRef([]);

const spotify = useSpotifyAPIStore();
async function load() {
  loading.value = true;

  album.value = await spotify.api.albums.get(props.id);
  const _tracks = await spotify.api.albums.tracks(props.id, undefined);

  tracks.value = [
    ..._tracks.items.map((track) =>
      fromSimplifiedSpotifyTrack(track, album.value!)
    ),
  ];

  if (_tracks.next) {
    tracks.value = [
      ...tracks.value,

      ...(
        await spotify.fetchAllPaginated<SimplifiedTrack>(
          _tracks.next,
          _tracks.total
        )
      ).map((track) => fromSimplifiedSpotifyTrack(track, album.value!)),
    ];
  }

  loading.value = false;
}
load();
</script>
