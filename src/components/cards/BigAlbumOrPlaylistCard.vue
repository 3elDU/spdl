<template>
  <HeaderCard :loading="loading" :avatar_src="item?.images.at(0)?.url">
    <template v-slot:overline> {{ item?.type }} </template>

    <template v-slot:title>
      {{ item?.name }}
    </template>

    <template v-slot:description v-if="item?.type === 'playlist'">
      {{ (item as Playlist).description }}
    </template>

    <template v-slot:artists v-if="item?.type === 'album'">
      <TrackArtists :artists="(item as Album).artists" />
    </template>
  </HeaderCard>
</template>

<script setup lang="ts">
import HeaderCard from './HeaderCard.vue';
import { Album, Playlist } from '@spotify/web-api-ts-sdk';
import TrackArtists from '../links/TrackArtists.vue';

defineProps<{
  loading?: boolean;
  type: 'album' | 'playlist';
  item?: Album | Playlist;
}>();
</script>
