import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { calculateTrackPath } from './download/downloader';
import { preferences, UserPreferences } from './store';
import { existsSync } from 'fs';
import { queue } from './download/queue';
import { downloadTrackQueued } from './download/worker';

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
    downloadTrackQueued(track);
  });
  ipcMain.handle(
    'spotify:trackExistsOnDisk',
    async (_event, track: TrackDownloadRequest) => {
      const path = calculateTrackPath(track);
      return existsSync(path);
    }
  );
}
