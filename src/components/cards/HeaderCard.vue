<template>
  <div
    class="tw-w-full tw-px-36 tw-py-16 tw-bg-neutral-100 dark:tw-bg-neutral-800 tw-flex tw-justify-center tw-flex-wrap tw-gap-8 tw-border-b tw-border-neutral-300 dark:tw-border-neutral-500"
  >
    <q-skeleton v-if="loading" size="192px" sqaure class="tw-rounded" />
    <slot v-else-if="$slots.avatar" name="avatar" />
    <q-avatar
      v-else-if="avatar_src"
      size="192px"
      rounded
      class="tw-shadow-md dark:tw-shadow-none dark:tw-outline dark:tw-outline-1 dark:tw-outline-neutral-500"
    >
      <img :src="avatar_src" />
    </q-avatar>

    <div v-if="loading">
      <q-skeleton type="text" width="8rem" />
      <q-skeleton type="text" width="20rem" height="6rem" />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
    </div>
    <div v-else>
      <div v-if="$slots.overline" class="text-overline text-uppercase">
        <slot name="overline" />
      </div>

      <div v-if="$slots.title" class="text-h3">
        <slot name="title" />
      </div>

      <div v-if="$slots.description" class="text-subtitle1 tw-line-clamp-4">
        <slot name="description" />
      </div>

      <div v-if="$slots.artists">
        <slot name="artists" />
      </div>

      <div v-if="$slots.tracksCount" class="text-subtitle2 tw-flex tw-flex-col">
        <div>
          <slot name="tracksCount" />
        </div>
        <div>
          <slot name="releaseYear" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean;
  // Avatar source
  avatar_src?: string;
}>();

defineSlots<{
  overline(): unknown;
  avatar(): unknown;
  title(): unknown;
  description(): unknown;
  artists(): unknown;
  tracksCount(): unknown;
  releaseYear(): unknown;
}>();
</script>
