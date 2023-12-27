import { Track } from '@spotify/web-api-ts-sdk';

declare global {
  interface BaseQueueItem {
    id: string;
    track: Track;
  }

  type QueueItemPending = {
    status: 'pending';
    request: TrackDownloadRequest;
  };
  type QueueItemDownloading = {
    status: 'downloading';
    progress: number;
  };
  type QueueItemError = { status: 'error'; error: unknown };
  type QueueItemSuccess = {
    status: 'success';
    path: string;
    tooltip: string;
  };

  type QueueItemData =
    | QueueItemPending
    | QueueItemDownloading
    | QueueItemError
    | QueueItemSuccess;

  type QueueItem = BaseQueueItem &
    (
      | QueueItemPending
      | QueueItemDownloading
      | QueueItemError
      | QueueItemSuccess
    );
}
