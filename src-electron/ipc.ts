import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import { calculateTrackPath, downloadTrack } from './download/downloader';
import { preferences, UserPreferences } from './store';
import { existsSync } from 'fs';
import { queue } from './download/queue';
import { downloadTrackQueued } from './download/worker';
import { statLibrary } from './stat/stat';
import localSearch from './search';

export default function registerIPCHandlers(window: BrowserWindow) {
  ipcMain.on('window-minimize', () => {
    window.minimize();
  });
  ipcMain.on('window-maximize', () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });
  ipcMain.on('window-close', () => {
    window.close();
  });

  ipcMain.on('relaunch', () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.handle('preferences:get', () => {
    return preferences.get('preferences');
  });
  ipcMain.on(
    'preferences:update',
    (_event, newPreferences: UserPreferences) => {
      preferences.set('preferences', newPreferences);
    }
  ),
    ipcMain.handle('preferences:chooseMusicDirectory', async () => {
      const result = await dialog.showOpenDialog(window, {
        properties: ['openDirectory', 'createDirectory'],
      });

      if (result.canceled) {
        return undefined;
      } else {
        return result.filePaths[0];
      }
    });
  ipcMain.on('preferences:openMusicDirectory', () => {
    shell.showItemInFolder(
      preferences.get('preferences.musicDirectory') as string
    );
  });

  ipcMain.handle('queue:get', () => {
    return queue.getAllItems();
  });

  ipcMain.on('spotify:downloadTrack', (_event, track: TrackDownloadRequest) => {
    downloadTrack(track);
  });
  ipcMain.on(
    'spotify:downloadTrackQueued',
    (_event, track: TrackDownloadRequest) => {
      downloadTrackQueued(track);
    }
  );
  ipcMain.handle(
    'spotify:trackExistsOnDisk',
    async (_event, track: TrackDownloadRequest) => {
      const path = calculateTrackPath(
        track.name,
        track.id,
        track.metadata.album_name,
        track.metadata.artist_names
      );
      return existsSync(path);
    }
  );

  ipcMain.handle('library:stat', async () => {
    return await statLibrary(preferences.get('preferences.musicDirectory'));
  });
  ipcMain.handle(
    'library:searchLocal',
    async (_event, query: string) => await localSearch(query)
  );
}
