import { SPDL } from 'app/types';

// Example:
// 335 -> 5:35
// Should also correctly format hours
export function formatTrackDuration(duration: number): string {
  if (Number.isNaN(duration)) {
    return '00:00';
  }

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

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
export function formatTrackAuthors(track: SPDL.Track): string {
  const artistNames = track.artists.map((artist) => artist.name);
  return artistNames.join(', ');
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(navigator.language);
}
