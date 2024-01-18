<template>
  <RouterLink
    :to="{
      name: 'tracklist',
      params: {
        type: 'album',
        id: track.album.id,
      },
    }"
  >
    {{ track.name }}
  </RouterLink>
</template>

<script setup lang="ts">
import { SPDL } from 'app/types';

defineProps<{
  track: SPDL.Track;
}>();
</script>
