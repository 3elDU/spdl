<template>
  <q-page
    class="tw-w-full tw-flex tw-flex-col tw-justify-start tw-items-center"
  >
    <BigAlbumOrPlaylistCard :loading="loading" type="album" :item="album" />

    <q-list v-if="!loading" class="tw-w-full tw-p-8">
      <q-intersection
        v-for="(track, idx) in tracks"
        :key="track.id"
        class="tw-h-14"
      >
        <TrackItem
          :track="track"
          :index="idx"
          show-duration
          show-download-button
        />
      </q-intersection>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { Album, SimplifiedTrack } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import TrackItem from 'src/components/track/TrackItem.vue';
import { fromSimplifiedSpotifyTrack } from 'app/types/convert';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { ref, Ref, watch } from 'vue';
import BigAlbumOrPlaylistCard from 'src/components/cards/BigAlbumOrPlaylistCard.vue';
import { collectGenerator } from 'src/util';

const props = defineProps<{
  id: string;
}>();

// Re-fetch data, when props change
watch(props, () => {
  load();
});

const loading: Ref<boolean> = ref(true);
const album: Ref<Album | undefined> = ref(undefined);
const tracks: Ref<SPDL.Track[]> = ref([]);

const spotify = useSpotifyAPIStore();
async function load() {
  loading.value = true;

  tracks.value = [];

  album.value = await spotify.api.albums.get(props.id);

  loading.value = false;

  const _tracks = await spotify.api.albums.tracks(props.id, undefined);

  tracks.value.push(
    ..._tracks.items.map((track) =>
      fromSimplifiedSpotifyTrack(track, album.value!)
    ),
    ...(
      await collectGenerator(spotify.fetchNext<SimplifiedTrack>(_tracks.next))
    ).map((track) => fromSimplifiedSpotifyTrack(track, album.value!))
  );
}
load();
</script>
