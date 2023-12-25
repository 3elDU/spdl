import { Track } from '@spotify/web-api-ts-sdk';

declare global {
  interface BaseQueueItem {
    id: string;
    track: Track;
  }

  type QueueItemData =
    | { status: 'pending'; progress: number }
    | { status: 'error'; error: unknown }
    | { status: 'success'; path: string; tooltip: string };

  type QueueItem = BaseQueueItem & QueueItemData;
}
