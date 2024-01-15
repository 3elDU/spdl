import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { UserPreferences } from 'app/src-electron/store';
import { defineStore } from 'pinia';
import { syncLikedTracks, syncPlaylist } from 'src/sync';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    preferences: {} as UserPreferences,
  }),

  getters: {
    availableMusicDirectories(): string[] {
      return [this.preferences.musicDirectory].concat(
        this.preferences.previousMusicDirectories
      );
    },
    playlistIsSynced() {
      return (playlist: SimplifiedPlaylist) =>
        this.preferences.syncedPlaylists.find(
          (item) => item.id === playlist.id
        ) !== undefined;
    },
  },

  actions: {
    syncPlaylist(playlist: SimplifiedPlaylist) {
      this.preferences.syncedPlaylists.push({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        cover: playlist.images.at(0)?.url,
        tracksCount: playlist.tracks?.total ?? 0,
        lastSynced: 0,
      });
      syncPlaylist(playlist.id);
    },
    unsyncPlaylist(playlist: SimplifiedPlaylist) {
      const idx = this.preferences.syncedPlaylists.findIndex(
        (value) => value.id === playlist.id
      );
      if (idx !== -1) {
        this.preferences.syncedPlaylists.splice(idx, 1);
      }
    },

    syncLikedTracks(likedTracksCount: number) {
      this.preferences.syncedLikedTracks = {
        synced: true,
        lastSynced: 0,
        tracksCount: likedTracksCount,
      };
      syncLikedTracks();
    },
    unsyncLikedTracks() {
      this.preferences.syncedLikedTracks.synced = false;
    },

    changeMusicFolder(newFolder: string) {
      const oldFolder = this.preferences.musicDirectory;

      // Append the current directory in previously selected directories array, if it isn't already there
      if (!this.preferences.previousMusicDirectories.includes(oldFolder)) {
        this.preferences.previousMusicDirectories.push(oldFolder);
      }

      // Remove new directory from previously selected directories, if it is there
      const i = this.preferences.previousMusicDirectories.indexOf(newFolder);
      if (i > -1) {
        this.preferences.previousMusicDirectories.splice(i, 1);
      }

      this.preferences.musicDirectory = newFolder;
    },
  },
});
