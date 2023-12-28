import { app } from 'electron';
import Store from 'electron-store';
import { availableParallelism } from 'os';
import { join } from 'path';

export interface SyncedPlaylist {
  id: string;
  name: string;
  description: string;
  cover?: string;
  // UNIX date
  lastSynced: number;
  tracksCount: number;
}

export interface SyncedLikedTracks {
  synced: boolean;
  // UNIX date
  lastSynced: number;
  tracksCount: number;
}

// Interface for the preferences object for use outside of this module
export interface UserPreferences {
  musicDirectory: string;
  parallelDownloadingLimit: number;
  previousMusicDirectories: string[];
  // Spotify's APP client ID can be specified in two places:
  // 1. In the .env file at build-time
  // 2. Set by the user at runtime (if client id in the .env file is not set),
  // and that's the purpose  of this option here
  spotifyAppClientID: string | undefined;
  syncedPlaylists: SyncedPlaylist[];
  // In spotify, liked tracks are represented as a separate entity from regular playlists
  syncedLikedTracks: SyncedLikedTracks;
}

export const preferences = new Store({
  schema: {
    preferences: {
      type: 'object',
      properties: {
        musicDirectory: {
          type: 'string',
          description: 'Base directory for saving music',
        },
        parallelDownloadingLimit: {
          type: 'number',
          description: 'How much tracks can be downloaded at the same time',
        },
        previousMusicDirectories: {
          type: 'array',
          description:
            'Directories for saving music previously chosen by the user',
          items: {
            type: 'string',
          },
        },
        spotifyAppClientID: {
          type: 'string',
        },
        syncedPlaylists: {
          type: 'array',
          description: 'List of playlists synced with spotify',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Spotify resource id of the playlist',
              },
              name: {
                type: 'string',
                description: 'Name of the playlist',
              },
              description: {
                type: 'string',
                description: 'Description of the playlist',
              },
              cover: {
                type: 'string',
                format: 'uri',
                description: 'Link to the cover image for the playlist',
              },
              lastSynced: {
                type: 'integer',
                description: 'Last time the playlist was synced with spotify',
              },
              tracksCount: {
                type: 'integer',
                description: 'Amount of tracks in the playlist',
              },
            },
            required: [
              'id',
              'name',
              'description',
              'lastSynced',
              'tracksCount',
            ],
            additionalProperties: false,
          },
        },
        syncedLikedTracks: {
          type: 'object',
          properties: {
            synced: {
              type: 'boolean',
            },
            lastSynced: {
              type: 'number',
            },
            tracksCount: {
              type: 'number',
            },
          },
          required: ['synced', 'lastSynced', 'tracksCount'],
          additionalProperties: false,
        },
      },
      required: [
        'musicDirectory',
        'parallelDownloadingLimit',
        'previousMusicDirectories',
        'syncedPlaylists',
        'syncedLikedTracks',
      ],
      additionalProperties: false,
    },
  },
  defaults: {
    preferences: {
      musicDirectory: join(app.getPath('music'), 'SPDL'),
      parallelDownloadingLimit: availableParallelism(),
      previousMusicDirectories: [] as string[],
      syncedPlaylists: [] as SyncedPlaylist[],
      syncedLikedTracks: {
        synced: false,
        lastSynced: 0,
        tracksCount: 0,
      } as SyncedLikedTracks,
    },
  },
});
