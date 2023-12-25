<template>
  <div class="column justify-left">
    <q-input
      v-model="query"
      type="search"
      label="Search for songs"
      outlined
      :loading="loading"
      @keypress.enter="search"
    >
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-checkbox v-model="searchLocal" size="xs" label="Search local files" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { initialQuery, initialSearchLocalOption } = withDefaults(
  defineProps<{
    initialQuery?: string;
    initialSearchLocalOption?: boolean;
    loading?: boolean;
  }>(),
  {
    initialQuery: '',
    initialSearchLocalOption: false,
    loading: false,
  }
);

const query = ref(initialQuery);
const searchLocal = ref(initialSearchLocalOption);

const emit = defineEmits<{
  search: [query: string, searchLocal: boolean];
}>();

function search() {
  emit('search', query.value, searchLocal.value);
}
</script>
