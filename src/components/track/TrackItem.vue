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
      <q-item-label class="tw-truncate">
        <TrackTitle :track="track" />
      </q-item-label>
      <q-item-label caption class="tw-truncate">
        <TrackArtists :artists="track.artists" />
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="showAlbumName">
      <TrackAlbum :album="track.album" />
    </q-item-section>

    <q-item-section side v-if="showDuration">
      <div>{{ formatTrackDuration(track.duration) }}</div>
    </q-item-section>
    <q-item-section side v-if="showDownloadButton && track">
      <TrackDownloadProgress show-download-button :track="track" />
    </q-item-section>

    <TrackContextMenu :track="track" />
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
import TrackContextMenu from './TrackContextMenu.vue';

defineProps<{
  track: SPDL.Track;
  index?: number;
  showAlbumCover?: boolean;
  showAlbumName?: boolean;
  showDuration?: boolean;
  showDownloadButton?: boolean;
}>();
</script>
