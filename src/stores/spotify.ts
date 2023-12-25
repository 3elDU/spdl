import { IRedirectionStrategy, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { defineStore } from 'pinia';

export function calculateRedirectURL(): string {
  return new URL(location.origin).href;
}

const redirectionStrategy: IRedirectionStrategy = {
  async redirect(targetUrl) {
    location.href = targetUrl as string;
  },
  async onReturnFromRedirect() {
    return;
  },
};

export const useSpotifyAPIStore = defineStore('spotify', {
  state: () => {
    const clientID = process.env.SPOTIFY_CLIENT_ID;

    return {
      authenticated: false,
      clientID,
      api: SpotifyApi.withUserAuthorization(
        clientID ?? '',
        calculateRedirectURL(),
        ['user-read-private'],
        { redirectionStrategy }
      ),
    };
  },
  actions: {
    async authenticate() {
      if (this.clientID === '') {
        return;
      }
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
        calculateRedirectURL(),
        ['user-read-private'],
        { redirectionStrategy }
      );
    },
  },
  persist: {
    paths: ['authenticated'],
  },
});
