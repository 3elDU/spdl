export declare namespace SPDL {
  export interface Track {
    // Audio file location on disk
    src?: string;
    // Track's ID from the spotify API
    id: string;
    // Track name
    name: string;
    // Artists for the track
    artists: Artist[];
    // Album the track belongs to
    album: Album;
    // Duration of the track in seconds
    duration: number;
    // Number of the track inside the album
    track_number: number;
  }

  export interface Artist {
    name: string;
  }

  export interface Album {
    id: string;
    name: string;
    release_year: number;
    // URL to the album cover picture
    cover_url?: string;
    // Buffer containing the album cover picture
    cover?: Buffer;
  }

  export namespace Queue {
    export interface BaseItem {
      id: string;
      track: SPDL.Track;
    }

    export type ItemPending = {
      status: 'pending';
    };
    export type ItemDownloading = {
      status: 'downloading';
      progress: number;
    };
    export type ItemError = { status: 'error'; error: unknown };
    export type ItemSuccess = {
      status: 'success';
      path: string;
      tooltip: string;
    };

    export type ItemData =
      | ItemPending
      | ItemDownloading
      | ItemError
      | ItemSuccess;

    export type Item = BaseItem &
      (ItemPending | ItemDownloading | ItemError | ItemSuccess);
  }
}
