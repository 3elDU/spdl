import { SPDL } from 'app/types';
import { findClosestMatch, searchYT } from './search';
import YTDlpWrap from 'yt-dlp-wrap';
import { join } from 'node:path';
import { app } from 'electron';

// Returns a direct URL to the best-possible quality stream of the given track
export async function getTrackStreamURL(
  track: SPDL.Track
): Promise<string | undefined> {
  const videos = await searchYT(track);
  if (videos.length === 0) {
    return undefined;
  }

  const video = findClosestMatch(videos, track.duration);
  if (video === undefined) {
    return undefined;
  }

  const ytDlp = new YTDlpWrap(join(app.getPath('userData'), 'ytdlp'));

  const info = await ytDlp.getVideoInfo([video.url, '-f', 'ba']);

  if (info.url) {
    return info.url;
  }
}
