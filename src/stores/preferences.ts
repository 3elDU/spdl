import { UserPreferences } from 'app/src-electron/store';
import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    preferences: {} as UserPreferences,
  }),
  actions: {
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
