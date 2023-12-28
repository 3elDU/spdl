import { Track } from '@spotify/web-api-ts-sdk';
import { UserPreferences } from './store';
import { LibraryStats } from './stat/stat';

interface ElectronIPC {
  minimize(): void;
  maximize(): void;
  close(): void;

  getPreferences(): Promise<UserPreferences>;
  updatePreferences(newPreferences: UserPreferences): void;
  onPreferencesUpdate(
    callback: (newPreferences: UserPreferences) => void
  ): void;
  chooseMusicDirectory(): Promise<string | undefined>;
  openMusicDirectory(): void;

  downloadTrack(track: Track, queued: boolean): void;
  trackExistsOnDisk(track: Track): Promise<boolean>;

  getQueueItems(): Promise<QueueItem[]>;
  onQueueUpdate(callback: (queue: QueueItem[]) => void): void;

  statLibrary(): Promise<LibraryStats>;
}

declare global {
  interface Window {
    ipc: ElectronIPC;
  }
}
