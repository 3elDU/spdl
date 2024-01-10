<template>
  <q-menu anchor="top left" self="bottom right" class="tw-h-[50vh]">
    <div class="tw-p-4 tw-flex tw-gap-2">
      <q-btn
        color="negative"
        icon="delete"
        label="Clear queue"
        outline
        @click="player.clearQueue"
        :disabled="!player.hasNextItems"
      />
      <q-btn
        color="negative"
        icon="delete"
        label="Clear history"
        outline
        @click="player.clearHistory"
        :disabled="!player.hasPreviousItems"
      />
    </div>

    <q-list separator>
      <q-item
        v-for="(track, idx) in player.history"
        :key="idx"
        :active="player.idx === idx"
      >
        <DynamicTrackIndex :index="idx" :track="track" switch-to-index />

        <q-item-section avatar>
          <TrackAlbumCover :track="track" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ track.name }}</q-item-label>
          <q-item-label caption>{{ formatTrackAuthors(track) }}</q-item-label>
        </q-item-section>

        <q-item-section side v-if="player.idx !== idx">
          <q-btn
            flat
            dense
            round
            icon="clear"
            @click="player.removeFromQueue(idx)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { usePlayerStore } from 'src/stores/player';
import { formatTrackAuthors } from 'src/util/util';
import TrackAlbumCover from 'components/TrackAlbumCover.vue';
import DynamicTrackIndex from 'components/DynamicTrackIndex.vue';

const player = usePlayerStore();
</script>
