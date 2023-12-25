import { Track } from '@spotify/web-api-ts-sdk';
import { contextBridge, ipcRenderer } from 'electron';
import { UserPreferences } from './store';

contextBridge.exposeInMainWorld('ipc', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

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

  downloadTrack: (track: Track) => {
    ipcRenderer.send('spotify:downloadTrack', {
      track: track,
      name: track.name,
      id: track.id,
      duration: track.duration_ms / 1000,
      metadata: {
        album_cover_url: track.album.images[0].url,
        track_title: track.name,
        album_name: track.album.name,
        artist_names: track.artists.map((artist) => artist.name),
        release_year: new Date(track.album.release_date).getFullYear(),
        track_number: track.track_number,
      },
    } as TrackDownloadRequest);
  },
  trackExistsOnDisk: (track: Track): Promise<boolean> => {
    return ipcRenderer.invoke('spotify:trackExistsOnDisk', {
      // We don't specify all properties of TrackDownloadRequest, since they aren't required
      track: track,
      name: track.name,
      id: track.id,
      metadata: {
        album_name: track.album.name,
        artist_names: track.artists.map((artist) => artist.name),
      },
    });
  },

  getQueueItems: (): Promise<QueueItem[]> => {
    return ipcRenderer.invoke('queue:get');
  },
  onQueueUpdate: (callback: (queue: QueueItem[]) => void) => {
    ipcRenderer.on('queue:update', (_event, queue: QueueItem[]) => {
      callback(queue);
    });
  },
});
