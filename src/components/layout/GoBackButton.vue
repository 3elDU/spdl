<template>
  <!-- Go back in history -->
  <q-btn
    dense
    round
    flat
    title="Go back"
    icon="arrow_back"
    class="tw-ml-2"
    @click="router.back()"
    :disabled="noPreviousEntries"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const noPreviousEntries = ref(history.state.back === null);

// Workaround, because Window.history is not reactive
watch(route, () => (noPreviousEntries.value = history.state.back === null));
</script>
