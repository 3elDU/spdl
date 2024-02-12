<template>
  <div v-if="player.track" class="tw-flex tw-items-center">
    <TrackAlbumCover :track="player.track" size="64px" />
    <q-item>
      <q-item-section>
        <q-item-label class="tw-flex tw-justify-start tw-gap-2">
          <TrackTitle :track="player.track" />
          <q-icon
            v-if="player.streamed"
            name="o_cloud"
            title="Streamed from YouTube"
          />
        </q-item-label>
        <q-item-label caption>
          <TrackArtists :artists="player.track.artists" />
        </q-item-label>
      </q-item-section>
    </q-item>

    <TrackContextMenu v-if="player.track" :track="player.track" />
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from 'src/stores/player';
import TrackArtists from '../links/TrackArtists.vue';
import TrackTitle from '../links/TrackTitle.vue';
import TrackAlbumCover from '../track/TrackAlbumCover.vue';
import TrackContextMenu from '../track/TrackContextMenu.vue';

const player = usePlayerStore();
</script>
