<template>
  <!-- Go forward in history -->
  <q-btn
    dense
    round
    flat
    title="Go forward"
    icon="arrow_forward"
    class="tw-mr-2"
    @click="router.forward()"
    :disabled="noNextEntries"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const noNextEntries = ref(history.state.forward === null);

// Workaround, because Window.history is not reactive
watch(route, () => (noNextEntries.value = history.state.forward === null));
</script>
