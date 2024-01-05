<template>
  <q-item-section
    side
    ref="item"
    class="tw-min-w-[50px] tw-flex tw-items-center"
  >
    <q-btn
      v-if="hovered"
      dense
      round
      flat
      icon="play_arrow"
      title="Play"
      @click="player.playFromIndex(index)"
    />
    <q-item-label v-else>{{ props.index + 1 }}</q-item-label>
  </q-item-section>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { SPDL } from 'app/types';
import { usePlayerStore } from 'src/stores/player';
import { ref } from 'vue';

// Shows track's index in the queue by default, and, when hovered
// shows a button to switch to track in the queue

const props = defineProps<{
  index: number;
  track: SPDL.Track;
}>();

const player = usePlayerStore();
const item = ref();
const hovered = useElementHover(item);
</script>
