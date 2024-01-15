<template>
  <q-menu
    anchor="top left"
    self="bottom right"
    class="tw-h-[50vh]"
    @show="scrollToCurrentTrack"
  >
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
        :ref="(el: QItem) => {
          if (idx === player.idx) {
            currentTrackRef = el;
          }
        }"
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
import { formatTrackAuthors } from 'src/util';
import TrackAlbumCover from 'components/track/TrackAlbumCover.vue';
import DynamicTrackIndex from 'components/track/DynamicTrackIndex.vue';
import { Ref, ref } from 'vue';
import { QItem } from 'quasar';

const player = usePlayerStore();

const currentTrackRef: Ref<QItem | undefined> = ref(undefined);
function scrollToCurrentTrack() {
  const element: Element = currentTrackRef.value?.$el;
  if (element) {
    element.scrollIntoView({
      block: 'center',
    });
  }
}
</script>