import { UserPreferences } from './store';
import { LibraryStats } from './stat/stat';
import { SPDL } from 'app/types';

interface ElectronIPC {
  minimize(): void;
  maximize(): void;
  close(): void;

  relaunch(): void;

  launchAuthServer(redirectURL: string): Promise<void>;
  redirectToApp(searchParams: string): void;

  getPreferences(): Promise<UserPreferences>;
  updatePreferences(newPreferences: UserPreferences): void;
  onPreferencesUpdate(
    callback: (newPreferences: UserPreferences) => void
  ): void;
  chooseMusicDirectory(): Promise<string | undefined>;
  openMusicDirectory(): void;

  downloadTrack(track: SPDL.Track, queued: boolean): void;
  // Returns path to the audio file, if track exists on disk
  trackExistsOnDisk(track: SPDL.Track): Promise<string | undefined>;

  getQueueItems(): Promise<SPDL.Queue.Item[]>;
  onQueueUpdate(callback: (queue: SPDL.Queue.Item[]) => void): void;

  statLibrary(): Promise<LibraryStats>;
  searchLocal(query: string): Promise<SPDL.Track[]>;
  // Returns base64-encoded .mp3 file
  loadAudioFile(track: SPDL.Track): Promise<string | undefined>;
}

declare global {
  interface Window {
    ipc: ElectronIPC;
  }
}
