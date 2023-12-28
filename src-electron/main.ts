import { app, BrowserWindow } from 'electron';
import path from 'path';
import os from 'os';
import registerIPCHandlers from './ipc';
import { preferences } from './store';
import { queue } from './download/queue';
import { initQueueWorker } from './download/worker';

// needed in case process is undefined under Linux
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

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

    autoHideMenuBar: true,
    // Initially the window is hidden. Show it only when the content is loaded and rendered
    show: false,
    frame: true,

    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 16,
      y: 16,
    },
    titleBarOverlay: {
      height: 50,
      color: '#1976d2',
      symbolColor: '#ffffff',
    },

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
  if (mainWindow !== undefined) {
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
