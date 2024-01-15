import { readFile, readdir, stat } from 'fs/promises';
import MP3Tag from 'mp3tag.js';
import { extname, join } from 'path';
import { preferences } from './store';
import Fuse from 'fuse.js';
import { SPDL } from 'app/types';

async function loadMetadata(filename: string): Promise<SPDL.Track> {
  const buffer = await readFile(filename);
  const mp3tag = new MP3Tag(buffer);

  mp3tag.read();

  // @ts-expect-error Types in mp3tag.js library are messed up
  const albumCover = mp3tag.tags.v2?.APIC?.at(0).data
    ? // @ts-expect-error Types in mp3tag.js library are messed up
      Buffer.from(mp3tag.tags.v2.APIC.at(0).data)
    : undefined;

  const spotify_ids_text = mp3tag.tags.v2?.['TXXX']?.find(
    (value) => value.description === 'spotify_ids'
  );
  if (spotify_ids_text === undefined) {
    throw new Error("No 'spotify_ids' property in metadata");
  }
  const spotify_ids: {
    track_id: string;
    album_id: string;
  } = JSON.parse(spotify_ids_text.text);

  return {
    id: spotify_ids.track_id,
    src: filename,
    name: mp3tag.tags.title,
    album: {
      id: spotify_ids.album_id,
      name: mp3tag.tags.album,
      release_year: Number.parseInt(mp3tag.tags.year),
      cover: albumCover,
    },
    artists: mp3tag.tags.artist.split(', ').map((artist) => ({ name: artist })),
    track_number: Number.parseInt(mp3tag.tags.track),
    duration: 0,
  };
}

// Returns a list of filenames for each track
async function gatherFiles(directory: string): Promise<string[]> {
  const files = await readdir(directory);
  let results: string[] = [];

  for (const file of files) {
    const path = join(directory, file);

    if ((await stat(path)).isDirectory()) {
      results = results.concat(await gatherFiles(path));
    } else if (extname(path).toLowerCase() === '.mp3') {
      results.push(path);
    }
  }

  return results;
}

export default async function localSearch(
  query: string
): Promise<SPDL.Track[]> {
  const files = await gatherFiles(
    preferences.get('preferences.musicDirectory')
  );
  const metadata = await Promise.all(
    files.map(async (filename) => await loadMetadata(filename))
  );

  const fuse = new Fuse(metadata, {
    shouldSort: true,
    includeMatches: true,
    keys: ['id', 'name', 'artists.name', 'album.name', 'album.release_year'],
  });

  return fuse.search(query).map((result) => result.item);
}
