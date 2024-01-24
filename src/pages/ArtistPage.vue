<template>
  <q-page>
    <HeaderCard :loading="loading" :avatar_src="artist?.images.at(0)?.url">
      <template v-slot:overline> Artist </template>
      <template v-slot:title> {{ artist?.name }} </template>
    </HeaderCard>

    <div v-if="!loading" class="tw-flex tw-flex-col tw-gap-8 tw-p-4">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Top tracks</div>
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <TrackItem
              v-for="(track, idx) in topTracks"
              :key="track.id"
              :track="track"
              :index="idx"
              show-album-cover
              show-album-name
              show-download-button
              show-duration
            />
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Albums</div>
        </q-card-section>

        <q-card-section>
          <div
            class="tw-grid tw-auto-rows-max tw-gap-4 tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-4"
          >
            <AlbumCard v-for="album in albums" :key="album.id" :album="album" />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Related artists</div>
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <ArtistLink
              v-for="artist in relatedArtists"
              :key="artist.id"
              :artist="artist"
            />
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Artist, SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';
import { fromSpotifyTrack } from 'app/types/convert';
import AlbumCard from 'src/components/cards/AlbumCard.vue';
import HeaderCard from 'src/components/cards/HeaderCard.vue';
import ArtistLink from 'src/components/links/ArtistLink.vue';
import TrackItem from 'src/components/track/TrackItem.vue';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { Ref, ref, watch } from 'vue';

const spotify = useSpotifyAPIStore();

const props = defineProps<{
  id: string;
}>();

// Refetch everything when props change
watch(props, () => {
  load();
});

const loading = ref(true);
const artist: Ref<Artist | undefined> = ref(undefined);
const topTracks: Ref<SPDL.Track[]> = ref([]);
const albums: Ref<SimplifiedAlbum[]> = ref([]);
const relatedArtists: Ref<Artist[]> = ref([]);

async function load() {
  loading.value = true;

  artist.value = await spotify.api.artists.get(props.id);

  const tracks = await spotify.api.artists.topTracks(props.id, 'UA');
  topTracks.value = tracks.tracks.map((track) => fromSpotifyTrack(track));

  const _albums = await spotify.api.artists.albums(props.id);
  albums.value = _albums.items;

  const _relatedArtists = await spotify.api.artists.relatedArtists(props.id);
  relatedArtists.value = _relatedArtists.artists;

  loading.value = false;
}
load();
</script>
