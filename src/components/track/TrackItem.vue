<template>
  <q-item>
    <DynamicTrackIndex
      v-if="index !== undefined"
      :loading="loading"
      :track="track"
      :index="index"
    />

    <q-item-section avatar v-if="showAlbumCover">
      <q-skeleton
        v-if="loading"
        type="QAvatar"
        square
        size="40px"
        class="tw-rounded"
      />
      <TrackAlbumCover v-else-if="track" :track="track" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="tw-truncate">
        <q-skeleton v-if="loading" type="text" width="10rem" />
        <TrackTitle v-else-if="track" :track="track" />
      </q-item-label>
      <q-item-label caption class="tw-truncate">
        <q-skeleton v-if="loading" type="text" width="6rem" />
        <TrackArtists v-else-if="track" :artists="track.artists" />
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="showAlbumName">
      <q-skeleton v-if="loading" type="text" width="10rem" />
      <TrackAlbum v-else-if="track" :album="track.album" />
    </q-item-section>

    <q-item-section side v-if="showDuration">
      <q-skeleton v-if="loading" type="text" width="3rem" />
      <div v-else-if="track">{{ formatTrackDuration(track.duration) }}</div>
    </q-item-section>
    <q-item-section side v-if="showDownloadButton && track">
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
  loading?: boolean;
  track?: SPDL.Track;
  index?: number;
  showAlbumCover?: boolean;
  showAlbumName?: boolean;
  showDuration?: boolean;
  showDownloadButton?: boolean;
}>();
</script>
