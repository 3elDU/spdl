import { SPDL } from 'app/types';
import { joinArtistNames } from 'app/types/util';
import YouTube, { Video } from 'youtube-sr';

export function assembleSearchQuery(track: SPDL.Track): string {
  return `${joinArtistNames(track.artists, ' ')} - ${track.name}`;
}

export async function searchYT(
  track: SPDL.Track,
  limit?: number
): Promise<Video[]> {
  // If the track has overriden the video ID, return that video immediately
  if (track.video_id) {
    return [
      await YouTube.getVideo(`https://youtube.com/watch?v=${track.video_id}`),
    ];
  }

  return await YouTube.search(assembleSearchQuery(track), {
    type: 'video',
    limit: limit ?? 5,
  });
}

// Find the closest matching video by length
export function findClosestMatch(
  searchResults: Video[],
  desiredLength: number
): Video | undefined {
  // Pick the first video
  const firstVideo = searchResults[0];

  // If the first video is less than 5 seconds different in length, return it
  if (Math.abs(firstVideo.duration / 1000 - desiredLength) < 5) {
    return firstVideo;
  }

  let closestDiff = Infinity;
  let closestId = -1;

  for (let i = 0; i < searchResults.length; i++) {
    const video = searchResults[i];

    const diff = Math.abs(video.duration / 1000 - desiredLength);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestId = i;
    }
  }

  if (closestId === -1) {
    return undefined;
  } else {
    return searchResults[closestId];
  }
}
