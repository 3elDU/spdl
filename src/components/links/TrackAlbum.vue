<template>
  <RouterLink
    :to="{
      name: 'album',
      params: {
        id: album.id,
      },
    }"
  >
    <div class="tw-truncate">
      {{ album.name }}
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { SPDL } from 'app/types';

defineProps<{
  album: SPDL.Album | SimplifiedAlbum;
}>();
</script>
