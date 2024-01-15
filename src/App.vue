<template>
  <Suspense>
    <router-view />
  </Suspense>
</template>

<script setup lang="ts">
import { toRaw } from 'vue';
import { usePreferencesStore } from 'src/stores/preferences';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { useQueueStore } from 'src/stores/queue';
import { setupSyncJob } from 'src/sync';
import { Notify } from 'quasar';

const queue = useQueueStore();
const preferences = usePreferencesStore();
const spotify = useSpotifyAPIStore();

/*
  Fetch user preferences from Electron,
  perform Spotify authentication,
  etc.
*/
async function init() {
  const receivedPreferences = await window.ipc.getPreferences();
  preferences.preferences = receivedPreferences;

  // Set clientID from preferences, if it is currently undefined, and it is set in the preferences
  if (
    spotify.clientID === undefined &&
    typeof preferences.preferences.spotifyAppClientID === 'string'
  ) {
    spotify.setClientID(preferences.preferences.spotifyAppClientID);
  }

  // Send new preferences through IPC, when they were updated
  preferences.$subscribe(
    (_mutation, store) => {
      window.ipc.updatePreferences(toRaw(store.preferences));
    },
    {
      deep: true,
    }
  );

  // Check if we were redirected from the spotify auth flow
  const params = new URLSearchParams(location.search);
  if (typeof params.get('code') === 'string' && spotify.clientID) {
    spotify.authenticate();
    Notify.create({
      type: 'positive',
      message: 'Successfully logged in',
    });
  } else if (spotify.authenticated) {
    // Or, if we are already authenticated, call authenticate
    // again to refresh access token, etc.
    spotify.authenticate();
  }
}

/*
  Register various event handlers and callbacks
*/
function registerHandlers() {
  // Receive preferences through IPC, when they were updated from the other side
  window.ipc.onPreferencesUpdate((newPreferences) => {
    preferences.$patch({
      preferences: newPreferences,
    });
  });

  // Fetch queue items from the backend
  window.ipc.getQueueItems().then((items) => {
    queue.items = items;
  });

  // Subscribe to queue updates
  window.ipc.onQueueUpdate((items) => {
    queue.items = items;
  });
}

init();
registerHandlers();

setupSyncJob();
</script>
