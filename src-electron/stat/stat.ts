import { readdir, stat } from 'fs/promises';
import { extname, join } from 'path';

export interface LibraryStats {
  // Amount of tracks in the library
  tracks: number;
  // Size of the library in megabytes
  sizeMB: number;
}

// Count the number of .mp3 files, and their total size in the specified directory
export async function statLibrary(directory: string): Promise<LibraryStats> {
  const files = await readdir(directory);
  const stats: LibraryStats = { tracks: 0, sizeMB: 0 };

  for (const file of files) {
    const filePath = join(directory as string, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      // If it's a directory, recursively search the files
      const subStats = await statLibrary(filePath);
      stats.tracks += subStats.tracks;
      stats.sizeMB += subStats.sizeMB;
    } else if (extname(filePath).toLowerCase() === '.mp3') {
      stats.tracks++;
      // Size is in bytes, so divide it by 1 MiB
      stats.sizeMB += fileStat.size / 1048576;
    }
  }

  return stats;
}
