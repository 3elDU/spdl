import { Page, PlaylistedTrack, SavedTrack } from '@spotify/web-api-ts-sdk';
import { storeToRefs } from 'pinia';
import { usePreferencesStore } from 'src/stores/preferences';
import { useSpotifyAPIStore } from 'src/stores/spotify';

function transformNextURL(fullURL: string): string {
  const url = new URL(fullURL);
  return url.pathname.replace('/v1/', '') + url.search;
}

let syncJobRunning = false;
export async function sync() {
  const spotify = useSpotifyAPIStore();

  if (syncJobRunning || !spotify.authenticated) {
    return;
  }
  syncJobRunning = true;

  console.log('Syncing!');

  const { preferences } = storeToRefs(usePreferencesStore());

  if (preferences.value.syncedLikedTracks.synced) {
    let tracks = await spotify.api.currentUser.tracks.savedTracks(50);

    let retrieved_all = false;
    while (!retrieved_all) {
      for (const track of tracks.items) {
        if (!(await window.ipc.trackExistsOnDisk(track.track))) {
          console.log(`Downloading track ${track.track.name}`);
          window.ipc.downloadTrack(track.track);
        }
      }

      if (tracks.next) {
        const url = transformNextURL(tracks.next);
        tracks = await spotify.api.makeRequest<Page<SavedTrack>>('GET', url);
      } else {
        retrieved_all = true;
      }
    }

    preferences.value.syncedLikedTracks.lastSynced = Date.now();
  }

  for (const playlist of preferences.value.syncedPlaylists) {
    let tracks = await spotify.api.playlists.getPlaylistItems(
      playlist.id,
      undefined,
      undefined,
      50
    );
    let retrieved_all = false;

    while (!retrieved_all) {
      for (const track of tracks.items) {
        // Check, if it isof the type track, not episde
        if (
          'album' in track.track &&
          !(await window.ipc.trackExistsOnDisk(track.track))
        ) {
          console.log(`Downloading track ${track.track.name}`);
          window.ipc.downloadTrack(track.track);
        }
      }

      if (tracks.next) {
        tracks = await spotify.api.makeRequest<Page<PlaylistedTrack>>(
          'GET',
          transformNextURL(tracks.next)
        );
      } else {
        retrieved_all = true;
      }
    }

    playlist.lastSynced = Date.now();
  }

  syncJobRunning = false;
}

export function setupSyncJob() {
  // Sync every 10 minutes
  setInterval(sync, 10 * 60 * 1000);

  // Run first sync in 10 seconds
  setTimeout(sync, 10_000);
}
