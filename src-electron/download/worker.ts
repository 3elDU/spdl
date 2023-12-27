import { preferences } from '../store';
import { downloadTrack } from './downloader';
import { queue } from './queue';

let tracksDownloading = 0;

export function downloadTrackQueued(request: TrackDownloadRequest) {
  if (
    queue.getAllItems().find((value) => value.id === request.id) === undefined
  ) {
    queue.addItem({
      status: 'pending',
      id: request.id,
      request: request,
      track: request.track,
    });
  }
}

async function tick() {
  if (
    tracksDownloading <
    preferences.get('preferences.parallelDownloadingLimit', 2)
  ) {
    const request = queue
      .getAllItems()
      .filter((item) => item.status === 'pending')
      .at(0) as (QueueItemPending & BaseQueueItem) | undefined;

    if (request) {
      tracksDownloading++;
      console.log(
        `${tracksDownloading}| downloading track ${request.track.name}`
      );
      downloadTrack(request.request)
        .then(() => {
          console.log(
            `${tracksDownloading}| downloaded track ${request.track.name}`
          );
        })
        .catch((error) => {
          console.log(
            `${tracksDownloading}| error | ${request.track.name} | ${error}`
          );
          queue.updateItem(request.id, {
            status: 'error',
            error: error,
          });
        })
        .finally(() => {
          tracksDownloading--;
        });
    }
  }
}

export function initQueueWorker() {
  setInterval(tick, 1000);
}
