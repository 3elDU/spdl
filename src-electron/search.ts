import { readdir, stat } from 'fs/promises';
import { extname, join } from 'path';
import { preferences } from './store';
import Fuse from 'fuse.js';
import { SPDL } from 'app/types';
import { loadTrackMetadata } from 'app/core/util';

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
    files.map(async (filename) => await loadTrackMetadata(filename))
  );

  const fuse = new Fuse(metadata, {
    shouldSort: true,
    includeMatches: true,
    keys: ['id', 'name', 'artists.name', 'album.name', 'album.release_year'],
  });

  return fuse.search(query).map((result) => result.item);
}
