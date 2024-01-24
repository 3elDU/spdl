<template>
  <div class="tw-truncate">
    <span v-for="artist in artists" :key="artist.id">
      <RouterLink
        :to="{
          name: 'artist',
          params: {
            id: artist.id,
          },
        }"
      >
        {{ artist.name }}
      </RouterLink>
      <span class="tw-whitespace-pre">, </span>
    </span>
  </div>
</template>

<style scoped>
/* Hide the last comma */
span:last-child > span {
  display: none;
}
</style>

<script setup lang="ts">
import { SimplifiedArtist } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';

defineProps<{
  artists: SPDL.Artist[] | SimplifiedArtist[];
}>();
</script>
