import LibraryStats from 'app/types/stat';
import { UserPreferences } from './store';
import { SPDL } from 'app/types';
import { Video } from 'youtube-sr';

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
  setThemePreference(theme: 'light' | 'dark' | 'system'): void;

  downloadTrack(track: SPDL.Track, queued: boolean): void;
  searchYT(track: SPDL.Track): Promise<Video[]>;
  getStreamingURL(track: SPDL.Track): Promise<string | undefined>;
  // Returns path to the audio file, if track exists on disk
  trackExistsOnDisk(track: SPDL.Track): Promise<string | undefined>;

  getQueueItems(): Promise<SPDL.Queue.Item[]>;
  onQueueUpdate(callback: (queue: SPDL.Queue.Item[]) => void): void;

  statLibrary(): Promise<LibraryStats | undefined>;
  searchLocal(query: string): Promise<SPDL.Track[]>;
  loadTrackMetadata(track: SPDL.Track): Promise<SPDL.Track | undefined>;
  // Returns base64-encoded .mp3 file
  loadAudioFile(track: SPDL.Track): Promise<string | undefined>;
  deleteTrack(track: SPDL.Track): Promise<void>;
  openTrackLocation(track: SPDL.Track): Promise<void>;
}

declare global {
  interface Window {
    ipc: ElectronIPC;
  }
}
