import { app } from 'electron';
import Store from 'electron-store';
import { join } from 'path';

// Interface for the preferences object for use outside of this module
export interface UserPreferences {
  musicDirectory: string;
  previousMusicDirectories: string[];
  // Spotify's APP client ID can be specified in two places:
  // 1. In the .env file at build-time
  // 2. Set by the user at runtime (if client id in the .env file is not set),
  // and that's the purpose  of this option here
  spotifyAppClientID: string | undefined;
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
      },
      required: ['musicDirectory', 'previousMusicDirectories'],
      additionalProperties: false,
    },
  },
  defaults: {
    preferences: {
      musicDirectory: join(app.getPath('music'), 'SPDL'),
      previousMusicDirectories: [] as string[],
    },
  },
});
