import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import { calculateTrackPath, downloadTrack } from './download/downloader';
import { preferences, UserPreferences } from './store';
import { existsSync } from 'fs';
import { queue } from './download/queue';
import { downloadTrackQueued } from './download/worker';
import { statLibrary } from './stat/stat';
import localSearch from './search';
import { readFile } from 'fs/promises';
import { SPDL } from 'app/types';
import initAuthServer from './auth';

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

  ipcMain.on('auth:launchServer', () => {
    initAuthServer();
  });
  ipcMain.on('auth:redirectToApp', (_event, searchParams: string) => {
    console.log(process.env.APP_URL);
    window.loadURL(new URL(searchParams, process.env.APP_URL).href);
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

  ipcMain.on('spotify:downloadTrack', (_event, track: SPDL.Track) => {
    downloadTrack(track);
  });
  ipcMain.on('spotify:downloadTrackQueued', (_event, track: SPDL.Track) => {
    downloadTrackQueued(track);
  });
  ipcMain.handle(
    'spotify:trackExistsOnDisk',
    async (_event, track: SPDL.Track) => {
      const path = calculateTrackPath(track);
      if (existsSync(path)) {
        return path;
      } else {
        return undefined;
      }
    }
  );

  ipcMain.handle('library:stat', async () => {
    return await statLibrary(preferences.get('preferences.musicDirectory'));
  });
  ipcMain.handle('library:loadAudioFile', async (_event, track: SPDL.Track) => {
    const path = calculateTrackPath(track);

    if (existsSync(path)) {
      const buf = await readFile(path);
      return buf.toString('base64');
    } else {
      return undefined;
    }
  });
  ipcMain.handle(
    'library:searchLocal',
    async (_event, query: string) => await localSearch(query)
  );
}
