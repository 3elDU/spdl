import { IRedirectionStrategy, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';

const redirectionStrategy: IRedirectionStrategy = {
  async redirect(targetUrl) {
    // If client ID wasn'st set yet, show an error and fail early
    if (!useSpotifyAPIStore().clientID) {
      Notify.create({
        type: 'negative',
        message: "Client ID isn't set!",
        caption:
          'Please set it the settings to be able to authenticate with Spotify',
      });
      return;
    }
    location.href = targetUrl as string;
  },
  async onReturnFromRedirect() {
    return;
  },
};

const scopes = [
  'user-read-private',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
];

export const useSpotifyAPIStore = defineStore('spotify', {
  state: () => {
    const clientID = process.env.SPOTIFY_CLIENT_ID;

    return {
      authenticated: false,
      clientID,
      api: SpotifyApi.withUserAuthorization(
        clientID ?? '',
        'http://localhost:61624/',
        scopes,
        { redirectionStrategy }
      ),
    };
  },
  actions: {
    async authenticate() {
      if (this.clientID === '') {
        return;
      }
      await window.ipc.launchAuthServer(
        new URL(location.pathname, location.origin).href
      );
      const res = await this.api.authenticate();
      this.authenticated = res.authenticated;
      console.log(`authenticate() called - ${this.authenticated}`);
    },
    logOut() {
      this.api.logOut();
      this.authenticated = false;
    },

    setClientID(clientID: string | undefined) {
      console.log(`setClientID() called with ${clientID}`);
      this.clientID = clientID;
      this.api = SpotifyApi.withUserAuthorization(
        clientID ?? '',
        'http://localhost:61624/',
        scopes,
        { redirectionStrategy }
      );
    },
  },
  persist: {
    paths: ['authenticated'],
  },
});
