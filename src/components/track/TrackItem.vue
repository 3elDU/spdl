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
        <TrackTitle :track="track" />
      </q-item-label>
      <q-item-label caption>
        <TrackArtists :artists="track.artists" />
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="showAlbumName">
      <TrackAlbum :album="track.album" />
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
import { formatTrackDuration } from 'src/util';
import TrackAlbum from '../links/TrackAlbum.vue';
import TrackArtists from '../links/TrackArtists.vue';
import TrackTitle from '../links/TrackTitle.vue';

defineProps<{
  track: SPDL.Track;
  index?: number;
  showAlbumCover?: boolean;
  showAlbumName?: boolean;
  showDuration?: boolean;
  showDownloadButton?: boolean;
}>();
</script>
