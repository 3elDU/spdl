import { Page, PlaylistedTrack, SavedTrack } from '@spotify/web-api-ts-sdk';
import { storeToRefs } from 'pinia';
import { usePreferencesStore } from 'src/stores/preferences';
import { useSpotifyAPIStore } from 'src/stores/spotify';

function transformNextURL(fullURL: string): string {
  const url = new URL(fullURL);
  return url.pathname.replace('/v1/', '') + url.search;
}

export async function syncLikedTracks() {
  console.log('Syncing liked tracks');

  const spotify = useSpotifyAPIStore();
  const { preferences } = storeToRefs(usePreferencesStore());
  let tracks = await spotify.api.currentUser.tracks.savedTracks(50);

  // Sync liked tracks
  let retrieved_all = false;
  while (!retrieved_all) {
    for (const track of tracks.items) {
      if (!(await window.ipc.trackExistsOnDisk(track.track))) {
        console.log(`Downloading track ${track.track.name}`);
        window.ipc.downloadTrack(track.track, true);
      }
    }

    if (tracks.next) {
      const url = transformNextURL(tracks.next);
      tracks = await spotify.api.makeRequest<Page<SavedTrack>>('GET', url);
    } else {
      retrieved_all = true;
    }
  }

  // Sync information about liked tracks
  preferences.value.syncedLikedTracks = {
    ...preferences.value.syncedLikedTracks,
    lastSynced: Date.now(),
    tracksCount: (await spotify.api.currentUser.tracks.savedTracks(0)).total,
  };

  preferences.value.syncedLikedTracks.lastSynced = Date.now();
}

export async function syncPlaylist(playlistID: string) {
  const spotify = useSpotifyAPIStore();
  const { preferences } = usePreferencesStore();

  const playlist = preferences.syncedPlaylists.find(
    (playlist) => playlist.id === playlistID
  );
  if (playlist === undefined) {
    return;
  }

  console.log(`Syncing playlist ${playlist.name}`);

  let tracks = await spotify.api.playlists.getPlaylistItems(
    playlist.id,
    undefined,
    undefined,
    50
  );
  let retrieved_all = false;

  // Sync tracks from playlist
  while (!retrieved_all) {
    for (const track of tracks.items) {
      // Check, if it isof the type track, not episde
      if (
        'album' in track.track &&
        !(await window.ipc.trackExistsOnDisk(track.track))
      ) {
        console.log(`Downloading track ${track.track.name}`);
        window.ipc.downloadTrack(track.track, true);
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

  // Sync information about playlist
  const spotifyPlaylist = await spotify.api.playlists.getPlaylist(playlist.id);
  const playlistIdx = preferences.syncedPlaylists.findIndex(
    (item) => item.id === playlist.id
  );
  preferences.syncedPlaylists[playlistIdx] = {
    ...playlist,
    name: spotifyPlaylist.name,
    description: spotifyPlaylist.description,
    tracksCount: spotifyPlaylist.tracks.total,
    cover: spotifyPlaylist.images.at(0)?.url,
    lastSynced: Date.now(),
  };
}

let syncJobRunning = false;
export async function sync() {
  const spotify = useSpotifyAPIStore();
  const { preferences } = storeToRefs(usePreferencesStore());

  if (syncJobRunning || !spotify.authenticated) {
    return;
  }
  syncJobRunning = true;
  console.log('Syncing!');

  if (preferences.value.syncedLikedTracks.synced) {
    syncLikedTracks();
  }

  for (const { id } of preferences.value.syncedPlaylists) {
    syncPlaylist(id);
  }

  syncJobRunning = false;
}

export function setupSyncJob() {
  // Sync every 10 minutes
  setInterval(sync, 10 * 60 * 1000);

  // Run first sync in 10 seconds
  setTimeout(sync, 10_000);
}
