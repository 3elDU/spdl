<template>
  <q-card flat bordered :style="{ height: albumCoverSize }">
    <q-card-section horizontal>
      <img
        :src="album.images.at(0)?.url"
        :width="`${albumCoverSize}px`"
        class="tw-aspect-square"
      />

      <q-card-section class="tw-overflow-hidden">
        <TrackAlbum class="text-h6" :album="album" />
        <div class="text-subtitle2">{{ album.total_tracks }} tracks</div>
        <div class="text-subtitle2">
          {{ new Date(album.release_date).getFullYear() }}
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import TrackAlbum from 'components/links/TrackAlbum.vue';
import { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';

withDefaults(
  defineProps<{
    album: SimplifiedAlbum;
    albumCoverSize?: number;
  }>(),
  {
    albumCoverSize: 128,
  }
);
</script>
