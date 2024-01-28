import { contextBridge, ipcRenderer } from 'electron';
import { UserPreferences } from './store';
import { SPDL } from 'app/types';

contextBridge.exposeInMainWorld('ipc', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  relaunch: () => ipcRenderer.send('relaunch'),

  launchAuthServer: () => ipcRenderer.send('auth:launchServer'),
  redirectToApp: (searchParams: string) =>
    ipcRenderer.send('auth:redirectToApp', searchParams),

  getPreferences: () => ipcRenderer.invoke('preferences:get'),
  updatePreferences: (newPreferences: UserPreferences) => {
    ipcRenderer.send('preferences:update', newPreferences);
  },
  onPreferencesUpdate: (
    callback: (newPreferences: UserPreferences) => void
  ) => {
    ipcRenderer.on(
      'preferences:update',
      (_event, newPreferences: UserPreferences) => {
        callback(newPreferences);
      }
    );
  },
  chooseMusicDirectory: () =>
    ipcRenderer.invoke('preferences:chooseMusicDirectory'),
  openMusicDirectory: () => ipcRenderer.send('preferences:openMusicDirectory'),
  setThemePreference: (theme: 'light' | 'dark' | 'system') =>
    ipcRenderer.send('preferences:setThemePreference', theme),

  downloadTrack: (track: SPDL.Track, queued: boolean) => {
    ipcRenderer.send(
      queued ? 'spotify:downloadTrackQueued' : 'spotify:downloadTrack',
      track
    );
  },
  getStreamingURL: (track: SPDL.Track) => {
    return ipcRenderer.invoke('spotify:getStreamingURL', track);
  },
  trackExistsOnDisk: (track: SPDL.Track): Promise<string | undefined> => {
    return ipcRenderer.invoke('spotify:trackExistsOnDisk', track);
  },

  getQueueItems: (): Promise<SPDL.Queue.Item[]> => {
    return ipcRenderer.invoke('queue:get');
  },
  onQueueUpdate: (callback: (queue: SPDL.Queue.Item[]) => void) => {
    ipcRenderer.on('queue:update', (_event, queue: SPDL.Queue.Item[]) => {
      callback(queue);
    });
  },

  statLibrary: () => ipcRenderer.invoke('library:stat'),
  searchLocal: (query: string) =>
    ipcRenderer.invoke('library:searchLocal', query),
  loadAudioFile: (track: SPDL.Track): Promise<string | undefined> =>
    ipcRenderer.invoke('library:loadAudioFile', track),
});
