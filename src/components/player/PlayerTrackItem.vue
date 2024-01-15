<template>
  <div v-if="player.track" class="tw-flex tw-items-center">
    <TrackAlbumCover :track="player.track" size="64px" />
    <q-item>
      <q-item-section>
        <q-item-label class="tw-flex tw-justify-start tw-gap-2">
          <RouterLink
            :to="{
              name: 'tracklist',
              params: {
                type: 'album',
                id: player.track.album.id,
              },
            }"
          >
            {{ player.track.name }}
          </RouterLink>
          <q-icon
            v-if="player.track.stream_url"
            name="o_cloud"
            title="Streamed from YouTube"
          />
        </q-item-label>
        <q-item-label caption>{{
          joinArtistNames(player.track.artists || [], ', ')
        }}</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup lang="ts">
import { joinArtistNames } from 'app/types/util';
import { usePlayerStore } from 'src/stores/player';
import TrackAlbumCover from '../track/TrackAlbumCover.vue';

const player = usePlayerStore();
</script>
