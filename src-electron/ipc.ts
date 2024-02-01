import {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} from 'electron';
import { downloadTrack } from 'app/core/downloader';
import { preferences, UserPreferences } from './store';
import { existsSync } from 'fs';
import { queue } from 'app/core/queue';
import { downloadTrackQueued } from 'app/core/worker';
import { statLibrary } from './stat/stat';
import localSearch from './search';
import { readFile, rm } from 'fs/promises';
import { SPDL } from 'app/types';
import initAuthServer from './auth';
import { getTrackStreamURL } from 'app/core/stream';
import { searchYT } from 'app/core/search';
import { Video } from 'youtube-sr';
import { calculateTrackPath, loadTrackMetadata } from 'app/core/util';

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
  ipcMain.on(
    'preferences:setThemePreference',
    (_event, theme: 'light' | 'dark' | 'system') => {
      preferences.set('preferences.themePreference', theme);
      nativeTheme.themeSource = theme;
    }
  );

  ipcMain.handle('queue:get', () => {
    return queue.getAllItems();
  });

  ipcMain.on('spotify:downloadTrack', (_event, track: SPDL.Track) => {
    downloadTrack(track);
  });
  ipcMain.handle('spotify:getStreamingURL', (_event, track: SPDL.Track) => {
    return getTrackStreamURL(track);
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

  ipcMain.handle(
    'youtube:search',
    async (_event, track: SPDL.Track): Promise<Video[]> => {
      return await searchYT(track, 10);
    }
  );

  ipcMain.handle('library:stat', async () => {
    return await statLibrary(preferences.get('preferences.musicDirectory'));
  });
  ipcMain.handle(
    'library:loadTrackMetadata',
    async (_event, track: SPDL.Track) => {
      const path = calculateTrackPath(track);
      if (path) {
        return loadTrackMetadata(path);
      }
    }
  );
  ipcMain.handle('library:loadAudioFile', async (_event, track: SPDL.Track) => {
    const path = calculateTrackPath(track);

    if (existsSync(path)) {
      const buf = await readFile(path);
      return 'data:audio/mp3;base64,' + buf.toString('base64');
    } else {
      return undefined;
    }
  });
  ipcMain.on('library:deleteTrack', async (_event, track: SPDL.Track) => {
    const path = calculateTrackPath(track);
    if (existsSync(path)) {
      await rm(path);
    }
  });
  ipcMain.on('library:openTrackLocation', async (_event, track: SPDL.Track) => {
    const path = calculateTrackPath(track);
    if (existsSync(path)) {
      await shell.showItemInFolder(path);
    }
  }),
    ipcMain.handle(
      'library:searchLocal',
      async (_event, query: string) => await localSearch(query)
    );
}
