import { readFile, readdir, stat } from 'fs/promises';
import MP3Tag from 'mp3tag.js';
import { extname, join } from 'path';
import { preferences } from './store';
import Fuse from 'fuse.js';
import { Track } from '@spotify/web-api-ts-sdk';

declare global {
  interface TrackSearchResult {
    // File location, applicable only for local search
    src?: string;
    track_title: string;
    album_name: string;
    artist_names: string[];
    release_year: number;
    track_number: number;
    duration_ms: number;
    // Can be a direct buffer, or a string pointing to a URL
    album_cover_image: Buffer | string;

    track?: Track;
  }
}

async function loadMetadata(filename: string): Promise<TrackSearchResult> {
  const buffer = await readFile(filename);
  const mp3tag = new MP3Tag(buffer);

  mp3tag.read();

  // @ts-expect-error Types in mp3tag.js library are messed up
  const albumCover = Buffer.from(mp3tag.tags.v2?.APIC?.at(0).data || []);

  return {
    src: filename,
    track_title: mp3tag.tags.title,
    album_name: mp3tag.tags.album,
    artist_names: mp3tag.tags.artist.split(', '),
    release_year: Number.parseInt(mp3tag.tags.year),
    track_number: Number.parseInt(mp3tag.tags.track),
    duration_ms: 0,
    album_cover_image: albumCover,
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
): Promise<TrackSearchResult[]> {
  const files = await gatherFiles(
    preferences.get('preferences.musicDirectory')
  );
  const metadata = await Promise.all(
    files.map(async (filename) => await loadMetadata(filename))
  );

  const fuse = new Fuse(metadata, {
    keys: ['track_title', 'album_title', 'artist_names'],
  });

  return fuse.search(query).map((result) => result.item);
}
