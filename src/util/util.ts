import { Track } from '@spotify/web-api-ts-sdk';

// Example:
// 335000 -> 5:35
// Should also correctly format hours
export function formatTrackDuration(duration_ms: number): string {
  // Convert milliseconds to seconds
  const durationInSeconds = Math.floor(duration_ms / 1000);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  // Format the time components
  const formattedHours =
    hours > 0 ? hours.toString().padStart(2, '0') + ':' : '';
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  // Combine the formatted components
  return formattedHours + formattedMinutes + ':' + formattedSeconds;
}

// Formats track's authors into a string
// Adds commas between authors if there's multiple
// Example output: 'Metallica, Black Sabbath, Red Hot Chilli Peppers'
export function formatTrackAuthors(track: Track): string {
  const artistNames = track.artists.map((artist) => artist.name);
  return artistNames.join(', ');
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(navigator.language);
}

export function spotifyTrackToSearchResult(track: Track): TrackSearchResult {
  return {
    album_cover_image: track.album.images[0].url,
    track_title: track.name,
    album_name: track.album.name,
    artist_names: track.artists.map((artist) => artist.name),
    release_year: new Date(track.album.release_date).getFullYear(),
    track_number: track.track_number,
    duration_ms: track.duration_ms,
    track,
  };
}
