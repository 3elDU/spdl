import { Track } from '@spotify/web-api-ts-sdk';
import { SPDL } from '.';

// Convert track object from the spotify API to SPDL.Track object
export function fromSpotifyTrack(track: Track): SPDL.Track {
  return {
    id: track.id,
    name: track.name,
    album: {
      id: track.album.id,
      name: track.album.name,
      cover_url: track.album.images.at(0)?.url,
      release_year: new Date(track.album.release_date).getFullYear(),
    },
    artists: track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    duration: track.duration_ms / 1000.0,
    track_number: track.track_number,
  };
}
