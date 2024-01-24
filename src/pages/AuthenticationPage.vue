<template>
  <q-page
    v-if="spotify.authenticated"
    padding
    class="tw-flex tw-flex-col tw-gap-4"
  >
    <q-item
      class="tw-border tw-border-[--q-positive] bg-green-2 rounded-borders"
    >
      <q-item-section avatar>
        <q-icon name="o_check_circle" />
      </q-item-section>

      <q-item-section>
        You are authenticated as {{ profile?.display_name }}
      </q-item-section>
    </q-item>

    <q-btn color="negative" label="Log out" @click="spotify.logOut()" />
  </q-page>
  <q-page v-else padding class="tw-flex tw-flex-col tw-gap-4">
    <q-item
      v-if="spotify.clientID === undefined"
      class="tw-border tw-border-[--q-warning] bg-orange-2 rounded-borders"
    >
      <q-item-section avatar>
        <q-icon name="o_warning" />
      </q-item-section>

      <q-item-section>
        <div>
          Spotify <strong>clientID</strong> variable is not set. You need it to
          be able to log into your account and access the API. <br />
          To get it, create an app in
          <a
            class="tw-underline"
            href="https://developer.spotify.com/dashboard/"
            target="_blank"
            >Spotify Dashboard</a
          >, and add
          <strong @click="copyRedirectURL" class="tw-cursor-pointer"
            >http://localhost:61624/</strong
          >
          to the list of Redirect URIs, then copy client id from settings and
          paste it in the input field below.
        </div>
      </q-item-section>
    </q-item>

    <q-item
      class="tw-border tw-border-[--q-info] bg-light-blue-2 rounded-borders"
    >
      <q-item-section avatar>
        <q-icon name="o_info" />
      </q-item-section>
      <q-item-section>
        Log into your spotify account to be able to download your playlists and
        access your recommendations
      </q-item-section>
    </q-item>

    <q-input
      v-model="clientIDInput"
      label="Put Client ID here"
      outlined
      clearable
      class="tw-max-w-xs"
      @clear="
        {
          clientIDInput = undefined;
          setClientID();
        }
      "
    />
    <q-btn color="primary" label="Set Client ID" @click="setClientID" />

    <q-btn
      color="primary"
      label="Login"
      @click="spotify.authenticate()"
      :disabled="spotify.clientID === undefined"
    />
  </q-page>
</template>

<script setup lang="ts">
import { UserProfile } from '@spotify/web-api-ts-sdk';
import { Notify } from 'quasar';
import { usePreferencesStore } from 'src/stores/preferences';
import { useSpotifyAPIStore } from 'src/stores/spotify';
import { Ref, ref } from 'vue';

const profile: Ref<UserProfile | undefined> = ref(undefined);

const spotify = useSpotifyAPIStore();
const preferences = usePreferencesStore();
const clientIDInput: Ref<string | undefined> = ref(
  spotify.clientID ?? preferences.preferences.spotifyAppClientID ?? ''
);

if (spotify.authenticated) {
  profile.value = await spotify.api.currentUser.profile();
} else {
  spotify.$subscribe(async (_mutation, spotify) => {
    if (spotify.authenticated) {
      profile.value = await spotify.api.currentUser.profile();
    }
  });
}

async function copyRedirectURL() {
  await navigator.clipboard.writeText('http://localhost:61624/');
  Notify.create({
    type: 'positive',
    message: 'Copied redirect URL to clipboard',
  });
}

async function setClientID() {
  spotify.$reset();
  usePreferencesStore().preferences.spotifyAppClientID = clientIDInput.value;
  spotify.setClientID(clientIDInput.value);
}
</script>
