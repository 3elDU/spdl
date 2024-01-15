<template>
  <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-8">
    <q-skeleton v-if="loading" size="192px" square class="tw-rounded-md" />
    <q-avatar
      v-else-if="item && item.images?.length > 0"
      size="192px"
      rounded
      class="shadow-5"
    >
      <img :src="item.images?.at(0)?.url" />
    </q-avatar>

    <div v-if="loading">
      <q-skeleton type="text" width="8rem" />
      <q-skeleton type="text" width="20rem" height="6rem" />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
    </div>
    <div v-else-if="item">
      <div class="text-overline text-uppercase">{{ type }}</div>
      <div class="text-h3" :title="item?.name">
        {{ item?.name }}
      </div>

      <div
        v-if="item?.type === 'playlist'"
        class="text-subtitle1 tw-line-clamp-4"
        :title="(item as Playlist).description"
      >
        {{ (item as Playlist).description }}
      </div>
      <div v-if="item?.type === 'album'">
        {{ (item as Album).artists.map((artist) => artist.name).join(', ') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Album, Playlist } from '@spotify/web-api-ts-sdk';

defineProps<{
  loading?: boolean;
  type: 'album' | 'playlist';
  item?: Album | Playlist;
}>();
</script>
