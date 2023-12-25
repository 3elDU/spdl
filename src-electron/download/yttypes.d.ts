import { Track } from '@spotify/web-api-ts-sdk';

declare global {
  interface VideoEntry {
    // Youtube's video ID
    id: string;
    // Video title
    title: string;
    // Duration of the video in seconds
    duration: number;
  }

  interface VideoSearchResults {
    // Search query
    title: string;
    entries: VideoEntry[];
  }

  // Metadata that will later be embedded in the downloaded file
  interface TrackEmbedData {
    album_cover_url: string;
    track_title: string;
    album_name: string;
    artist_names: string[];
    track_number: number;
    release_year: number;
  }

  interface TrackDownloadRequest {
    name: string;
    // Spotify track ID
    id: string;
    duration: number;
    metadata: TrackEmbedData;
    // Track object from the spotify API
    track: Track;
  }
}
