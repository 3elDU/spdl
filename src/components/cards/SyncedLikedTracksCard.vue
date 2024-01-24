<template>
  <q-card flat bordered class="tw-h-32 tw-box-content">
    <q-card-section horizontal>
      <q-avatar square size="128px" color="primary" text-color="white">
        <q-icon name="favorite" size="64px" />
      </q-avatar>

      <q-card-section class="tw-overflow-hidden">
        <RouterLink class="text-h6 tw-truncate" to="favourites"
          >Liked songs</RouterLink
        >
        <div class="text-subtitle2">{{ likedTracksCount }} Tracks</div>
      </q-card-section>

      <q-card-actions vertical class="tw-ml-auto">
        <q-btn
          v-if="preferences.preferences.syncedLikedTracks.synced"
          color="positive"
          dense
          flat
          round
          aria-label="Liked tracks are synced. Click to turn off sync"
          @click="preferences.unsyncLikedTracks()"
        >
          <q-icon name="sync" />
        </q-btn>
        <q-btn
          v-else
          color="negative"
          dense
          flat
          round
          aria-label="Sync liked tracks"
          @click="preferences.syncLikedTracks"
        >
          <q-icon name="sync_disabled" />
        </q-btn>
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { usePreferencesStore } from 'src/stores/preferences';

defineProps<{
  likedTracksCount: number;
}>();

const preferences = usePreferencesStore();
</script>
