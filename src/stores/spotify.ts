import {
  IHandleErrors,
  IRedirectionStrategy,
  Page,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { transformNextURL } from 'src/util';

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

const errorHandler: IHandleErrors = {
  async handleErrors(error): Promise<boolean> {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error when calling Spotify API',
      caption: error.toString(),
      multiLine: true,
      timeout: 0,
      actions: [
        {
          label: 'Dismiss',
          color: 'white',
          handler() {
            return;
          },
        },
        {
          label: 'Refresh',
          color: 'white',
          handler() {
            location.reload();
          },
        },
      ],
    });
    return true;
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
        { redirectionStrategy, errorHandler }
      ),
    };
  },
  actions: {
    async authenticate() {
      if (!this.clientID) {
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
      if (clientID) {
        this.api = SpotifyApi.withUserAuthorization(
          clientID ?? '',
          'http://localhost:61624/',
          scopes,
          { redirectionStrategy, errorHandler }
        );
      }
    },

    // A utility method to fetch remaining items using the .next property
    async *fetchNext<Type>(next: string | null | undefined) {
      while (next) {
        const page: Page<Type> = await this.api.makeRequest<Page<Type>>(
          'GET',
          transformNextURL(next)
        );

        for (const item of page.items) {
          yield item;
        }

        next = page.next;
      }
    },

    // A utility method to fetch all remaining items using the .next property in parallel
    async fetchAllPaginated<Type>(
      next: string,
      total: number
    ): Promise<Type[]> {
      const urls = [];

      const nextURL = new URL(next);

      // Assemble an array with URLs to fetch all the items at once
      const initialOffset = Number.parseInt(
        nextURL.searchParams.get('offset')!
      );
      const limit = Number.parseInt(nextURL.searchParams.get('limit')!);
      for (let i = initialOffset; i <= total; i += limit) {
        nextURL.searchParams.set('offset', i.toString());
        urls.push(nextURL.toString());
      }

      // Fetch items in parallel with Promise.all()
      const items = await Promise.all(
        urls.map((url) =>
          this.api.makeRequest<Page<Type>>('GET', transformNextURL(url))
        )
      );

      // Extract items from the wrapper Page object
      return items.map((page) => page.items).flat();
    },
  },
  persist: {
    paths: ['authenticated'],
  },
});
