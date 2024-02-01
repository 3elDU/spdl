// Parses the time format "HH:MM:SS" (where HH and MM parts are entirely optional)

import { preferences } from 'app/src-electron/store';
import { SPDL } from 'app/types';
import { readFile } from 'fs/promises';
import MP3Tag from 'mp3tag.js';
import { join } from 'path';

// into a single number of seconds
export function parseTimeToSeconds(timeString: string): number {
  // Split the time string into hours, minutes, and seconds
  const timeParts = timeString.split(':');

  // Extract hours, minutes, and seconds
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (timeParts.length === 3) {
    // If all three parts are present (HH:MM:SS)
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]);
    seconds = parseInt(timeParts[2]);
  } else if (timeParts.length === 2) {
    // If only hours and minutes are present (HH:MM)
    minutes = parseInt(timeParts[0]);
    seconds = parseInt(timeParts[1]);
  } else if (timeParts.length === 1) {
    // If only seconds are present (SS)
    seconds = parseInt(timeParts[0]);
  }

  // Calculate total seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
}

// Sanitizes part of the path, e.g. album name, or the author name.
function sanitizePath(path: string): string {
  return path
    .replace(/[/\\:?*<>|'"]+/g, '_')
    .replace(/\.+$/, '') // replace dots at the end
    .trim();
}

export function calculateTrackPath(track: SPDL.Track): string {
  return join(
    preferences.get('preferences.musicDirectory'),
    sanitizePath(track.artists[0].name),
    sanitizePath(track.album.name),
    sanitizePath(`${track.name}_${track.id}.mp3`)
  );
}

export async function loadTrackMetadata(filename: string): Promise<SPDL.Track> {
  const buffer = await readFile(filename);
  const mp3tag = new MP3Tag(buffer);

  mp3tag.read();

  // @ts-expect-error Types in mp3tag.js library are messed up
  const albumCover = mp3tag.tags.v2?.APIC?.at(0).data
    ? // @ts-expect-error Types in mp3tag.js library are messed up
      Buffer.from(mp3tag.tags.v2.APIC.at(0).data)
    : undefined;

  const track_obj_json = mp3tag.tags.v2?.['TXXX']?.find(
    (value) => value.description === 'track_obj'
  );
  if (track_obj_json === undefined) {
    throw new Error("No 'track_obj' property in metadata");
  }

  const track_obj: SPDL.Track = JSON.parse(track_obj_json.text);
  track_obj.album.cover = albumCover;

  return track_obj;
}
