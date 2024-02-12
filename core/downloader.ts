import { app } from 'electron';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { basename, dirname, join } from 'path';
import MP3Tag from 'mp3tag.js';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpegPath from 'ffmpeg-static';
import { preferences } from 'app/src-electron/store';
import { queue } from './queue';
import { joinArtistNames } from 'app/types/util';
import { SPDL } from 'app/types';
import { assembleSearchQuery, findClosestMatch, searchYT } from './search';
import { calculateTrackPath } from './util';
import { existsSync } from 'fs';

function calculateYtdlpPath(): string {
  return join(
    app.getPath('userData'),
    'ytdlp' + (process.platform == 'win32' ? '.exe' : '')
  );
}

const ytDlp = new YTDlpWrap(calculateYtdlpPath());

let downloading = false;
export async function downloadYTDLP() {
  if (downloading) {
    return;
  }
  downloading = true;

  // Grab the latest release
  const releases = await YTDlpWrap.getGithubReleases(1, 1);
  const latestReleaseVersion: string = releases[0]?.tag_name;
  console.log(`Downloading release: ${latestReleaseVersion}`);

  const ytdlpPath = calculateYtdlpPath();
  console.log(`YTDLP path: ${ytdlpPath}`);

  await YTDlpWrap.downloadFromGithub(ytdlpPath, latestReleaseVersion);
  preferences.set('ytdlp_downloaded', true);
  downloading = false;
}

// Downloads the track from YouTube, and embeds metadata in it automatically
export async function downloadTrack(track: SPDL.Track): Promise<void> {
  if (ffmpegPath === null) {
    throw new Error('no ffmpeg!');
  }

  queue.updateItem(track.id, {
    status: 'downloading',
    progress: 0,
  });

  const fullPath = calculateTrackPath(track);
  const trackPath = dirname(fullPath);
  const trackFilename = basename(fullPath);

  // Delete the previous version from disk, if it exists
  if (existsSync(fullPath)) {
    await rm(fullPath);
  }

  // Create parent directories for the track first
  await mkdir(dirname(fullPath), {
    recursive: true,
  });

  const videoResults = await searchYT(track);
  if (videoResults.length === 0) {
    queue.updateItem(track.id, {
      status: 'error',
      error: 'No videos found!',
    });
    return;
  }

  queue.updateItem(track.id, {
    status: 'downloading',
    progress: 10,
  });

  const closestMatch = findClosestMatch(videoResults, track.duration);

  if (closestMatch === undefined) {
    queue.updateItem(track.id, {
      status: 'error',
      error: 'No videos found!',
    });
    return;
  }

  // When the app is packages for ASAR format, ffmpeg-static points to the wrong path
  const ffmpeg = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
  return new Promise<void>((resolve, reject) => {
    ytDlp
      .exec([
        '-x',
        '--ffmpeg-location',
        ffmpeg,
        '--audio-format',
        'mp3',
        '-f',
        'ba',
        '-P',
        trackPath,
        '-o',
        trackFilename,
        '--',
        closestMatch.id as string,
      ])
      .on('progress', (progress) => {
        queue.updateItem(track.id, {
          status: 'downloading',
          progress: 10 + (progress.percent ?? 0) * 0.8,
        });
      })
      .on('close', async () => {
        await embedMetadata(fullPath, track);
        queue.updateItem(track.id, {
          status: 'success',
          path: fullPath,
          tooltip: `Search query - '${assembleSearchQuery(track)}'`,
        });

        // Remove item from a queue after 30 seconds
        setTimeout(() => {
          queue.deleteItem(track.id);
        }, 30_000);

        resolve();
      })
      .on('error', async (error) => {
        queue.updateItem(track.id, {
          status: 'error',
          error: error,
        });

        reject(error);
      });
  });
}

// Embeds ID3 metadata into existing .mp3 file
async function embedMetadata(path: string, track: SPDL.Track) {
  const buffer = await readFile(path);
  const mp3tag = new MP3Tag(buffer);

  mp3tag.read();

  mp3tag.tags.title = track.name;
  mp3tag.tags.artist = joinArtistNames(track.artists, ', ');
  mp3tag.tags.year = track.album.release_year.toString();
  mp3tag.tags.album = track.album.name;
  mp3tag.tags.track = track.track_number.toString();

  if (track.album.cover_url) {
    // Fetch album cover
    const response = await fetch(track.album.cover_url);
    const albumCoverBuffer = await response.arrayBuffer();
    const albumCoverData = Array.from(new Uint8Array(albumCoverBuffer));

    if (mp3tag.tags.v2) {
      // @ts-expect-error Typings in the mp3tag.js library itself are messed up
      // https://mp3tag.js.org/docs/frames.html#v2-apic
      // In the documentation they say APIC must be an array with objects,
      // but in the typings it is a single object
      // Documentation is, in fact, right, and typings are wrong.
      mp3tag.tags.v2['APIC'] = [
        {
          type: 3,
          format: 'image/jpeg',
          description: 'Cover',
          data: albumCoverData,
        },
      ];

      mp3tag.tags.v2['TXXX'] = [
        {
          description: 'track_obj',
          text: JSON.stringify(track),
        },
      ];
    }
  }

  mp3tag.save();

  if (mp3tag.error !== '') {
    queue.updateItem(track.id, {
      status: 'error',
      error: mp3tag.error,
    });
  }

  mp3tag.read();

  await writeFile(path, Buffer.from(mp3tag.buffer));
}
