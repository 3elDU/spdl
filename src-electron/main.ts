import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';
import registerIPCHandlers from './ipc';
import { preferences } from './store';
import { queue } from 'app/core/queue';
import { initQueueWorker } from 'app/core/worker';
import initAuthServer from './auth';

// needed in case process is undefined under Linux
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

function getApplicationTheme(): 'light' | 'dark' {
  if (preferences.get('preferences.themePreference') != 'system') {
    return preferences.get('preferences.themePreference');
  } else {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }
}

function getWindowControlsColor(): string {
  if (preferences.get('preferences.fluentUIMode')) {
    const theme = getApplicationTheme();
    if (theme == 'dark') {
      return 'white';
    } else {
      return 'black';
    }
  } else {
    // In default design mode, always use white color for window controls,
    // as the titlebar color stays the same in light and dark mode
    return 'white';
  }
}

function getTitleBarOverlayOptions() {
  return {
    height: 50,
    // Transparent background for window controls
    color: 'rgba(0, 0, 0, 0.0)',
    symbolColor: getWindowControlsColor(),
  };
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon

    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    useContentSize: true,
    // Effective only on Windows 11. Applies Mica background effect to the window.
    // https://learn.microsoft.com/en-us/windows/apps/design/style/mica
    backgroundMaterial: preferences.get('preferences.fluentUIMode')
      ? 'mica'
      : undefined,

    autoHideMenuBar: true,
    // Initially the window is hidden. Show it only when the content is loaded and rendered
    show: false,
    frame: true,

    titleBarStyle: 'hidden',
    // for darwin
    trafficLightPosition: {
      x: 16,
      y: 16,
    },
    // for win32
    titleBarOverlay: getTitleBarOverlayOptions(),

    webPreferences: {
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);
}

function handleWindowEvents() {
  // Gracefully show a window, only when it is fully loaded
  mainWindow?.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow?.on('closed', () => {
    mainWindow = undefined;
  });

  nativeTheme.on('updated', () => {
    mainWindow!.setTitleBarOverlay(getTitleBarOverlayOptions());
  });

  preferences.onDidChange('preferences', (preferences) => {
    mainWindow?.webContents.send('preferences:update', preferences);
  });

  queue.attachCallback((queue) => {
    mainWindow?.webContents.send('queue:update', queue);
  });
}

function init() {
  createWindow();
  initQueueWorker();
  initAuthServer();
  if (mainWindow !== undefined) {
    // Override theme, if set by user
    nativeTheme.themeSource = preferences.get('preferences.themePreference');

    registerIPCHandlers(mainWindow);
    handleWindowEvents();
  }
}

app.whenReady().then(init);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});
