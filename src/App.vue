<template>
  <Suspense>
    <router-view />
  </Suspense>
</template>

<script setup lang="ts">
import { toRaw } from 'vue';
import { usePreferencesStore } from './stores/preferences';
import { useSpotifyAPIStore } from './stores/spotify';
import { useQueueStore } from './stores/queue';
import { Notify } from 'quasar';

const queue = useQueueStore();
const preferences = usePreferencesStore();
const spotify = useSpotifyAPIStore();

// Fetch preferences and put them into the store.
// Fetching preferences directly in async state function doesn't work for some reason.
window.ipc.getPreferences().then((receivedPreferences) => {
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

  // Receive preferences through IPC, when they were updated from the other side
  window.ipc.onPreferencesUpdate((newPreferences) => {
    preferences.$patch({
      preferences: newPreferences,
    });
  });
});

// Check if we were redirected from the spotify auth flow
const params = new URLSearchParams(location.search);
if (typeof params.get('code') === 'string') {
  // If the clientID is already set (e.g., it is set via .env file),
  // proceed with authentication
  if (typeof spotify.clientID === 'string') {
    spotify.authenticate();
    Notify.create({
      type: 'positive',
      message: 'Successfully logged in',
    });
  } else {
    // Because this code executes very early in the app lifecycle,
    // the clientID can be not (yet) set (it is set externally, and asynchronously),
    // so we subscribe to the store, to authenticate only when it was set
    const removeWatcher = spotify.$subscribe((_mutation, state) => {
      if (typeof state.clientID === 'string') {
        spotify.authenticate();
        removeWatcher();
        Notify.create({
          type: 'positive',
          message: 'Successfully logged in',
        });
      }
    });
  }
} else if (spotify.authenticated) {
  // Or, if we are already authenticated, call authenticate
  // again to refresh access token, etc.
  spotify.authenticate();
}

// Fetch queue items from the backend
window.ipc.getQueueItems().then((items) => {
  queue.items = items;
});

// Subscribe to queue updates
window.ipc.onQueueUpdate((items) => {
  queue.items = items;
});
</script>
