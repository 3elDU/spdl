<template>
  <q-item>
    <DynamicTrackIndex
      v-if="index !== undefined"
      :track="track"
      :index="index"
    />

    <q-item-section avatar v-if="showAlbumCover">
      <TrackAlbumCover :track="track" />
    </q-item-section>

    <q-item-section>
      <q-item-label>
        {{ track.name }}
      </q-item-label>
      <q-item-label caption>
        {{ formatTrackAuthors(track) }}
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="showAlbumName">
      <RouterLink
        :to="{
          name: 'tracklist',
          params: {
            type: 'album',
            id: track.album.id,
          },
        }"
      >
        {{ track.album.name }}
      </RouterLink>
    </q-item-section>

    <q-item-section side v-if="showDuration">
      {{ formatTrackDuration(track.duration) }}
    </q-item-section>
    <q-item-section side v-if="showDownloadButton">
      <TrackDownloadProgress show-download-button :track="track" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { SPDL } from 'app/types';
import DynamicTrackIndex from 'components/track/DynamicTrackIndex.vue';
import TrackAlbumCover from 'components/track/TrackAlbumCover.vue';
import TrackDownloadProgress from 'components/track/TrackDownloadProgress.vue';
import { formatTrackAuthors, formatTrackDuration } from 'src/util';

defineProps<{
  track: SPDL.Track;
  index?: number;
  showAlbumCover?: boolean;
  showAlbumName?: boolean;
  showDuration?: boolean;
  showDownloadButton?: boolean;
}>();
</script>
