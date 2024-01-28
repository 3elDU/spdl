<template>
  <q-item>
    <q-item-section avatar>
      <img
        :src="artist.images.at(0)?.url"
        class="tw-size-12 tw-rounded-full tw-border-solid tw-border tw-border-neutral-500"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label>
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
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { Artist } from '@spotify/web-api-ts-sdk';

defineProps<{
  artist: Artist;
}>();
</script>
