import { app } from 'electron';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { basename, dirname, join } from 'path';
import MP3Tag from 'mp3tag.js';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpegPath from 'ffmpeg-static';
import { preferences } from '../store';
import { existsSync } from 'fs';
import { queue } from './queue';

function calculateYtdlpPath(): string {
  return join(
    app.getPath('userData'),
    'ytdlp' + (process.platform == 'win32' ? '.exe' : '')
  );
}

const ytDlp = new YTDlpWrap(calculateYtdlpPath());

async function downloadYTDLP() {
  // Skip, if yt-dlp is already downloaded
  if (existsSync(calculateYtdlpPath())) {
    return;
  }

  // Grab the latest release
  const releases = await YTDlpWrap.getGithubReleases(1, 1);
  const latestReleaseVersion: string = releases[0]?.tag_name;
  console.log(`Downloading release: ${latestReleaseVersion}`);

  const ytdlpPath = calculateYtdlpPath();
  console.log(`YTDLP path: ${ytdlpPath}`);

  await YTDlpWrap.downloadFromGithub(ytdlpPath, latestReleaseVersion);
}

// Sanitizes part of the path, e.g. album name, or the author name.
function sanitizePath(path: string): string {
  return path.replace(/[/\\:?*<>|'"]+/g, '_').replace(/\.+$/, ''); // replace dots at the end
}

export function calculateTrackPath(track: TrackDownloadRequest): string {
  return join(
    preferences.get('preferences.musicDirectory'),
    sanitizePath(track.metadata.artist_names[0]),
    sanitizePath(track.metadata.album_name),
    sanitizePath(`${track.name}_${track.id}.mp3`)
  );
}

// Downloads the track from YouTube, and embeds metadata in it automatically
export async function downloadTrack(
  track: TrackDownloadRequest
): Promise<void> {
  await downloadYTDLP();
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

  // Create parent directories for the track first
  await mkdir(dirname(fullPath), {
    recursive: true,
  });

  const youtubeSearchQuery = `${track.metadata.artist_names.join(' ')} ${
    track.name
  }`;
  const result: VideoSearchResults = JSON.parse(
    await ytDlp.execPromise([`ytsearch5:${youtubeSearchQuery}`, '-J'])
  );

  queue.updateItem(track.id, {
    status: 'downloading',
    progress: 10,
  });

  const closestMatch = findClosestMatch(result.entries, track.duration);
  return new Promise<void>((resolve, reject) => {
    ytDlp
      .exec([
        '-x',
        '--ffmpeg-location',
        ffmpegPath as string,
        '--audio-format',
        'mp3',
        '-f',
        'ba',
        '-P',
        trackPath,
        '-o',
        trackFilename,
        '--',
        closestMatch.id,
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
          tooltip: `Search query - '${youtubeSearchQuery}'`,
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
async function embedMetadata(path: string, track: TrackDownloadRequest) {
  const metadata = track.metadata;
  const buffer = await readFile(path);
  const mp3tag = new MP3Tag(buffer);

  mp3tag.read();

  mp3tag.tags.title = metadata.track_title;
  mp3tag.tags.artist = metadata.artist_names.join(', ');
  mp3tag.tags.year = metadata.release_year.toString();
  mp3tag.tags.album = metadata.album_name;
  mp3tag.tags.track = metadata.track_number.toString();

  // Fetch album cover
  const response = await fetch(metadata.album_cover_url);
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

// Find the closest matching video by length
function findClosestMatch(
  searchResults: VideoEntry[],
  desiredLength: number
): VideoEntry {
  let closestDiff = Infinity;
  let closestId = -1;

  for (let i = 0; i < searchResults.length; i++) {
    const video = searchResults[i];

    const diff = Math.abs(video.duration - desiredLength);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestId = i;
    }
  }

  return searchResults[closestId];
}
