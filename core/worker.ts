import { SPDL } from 'app/types';
import { preferences } from 'app/src-electron/store';
import { downloadTrack, downloadYTDLP } from './downloader';
import { queue } from './queue';

let tracksDownloading = 0;

export function downloadTrackQueued(track: SPDL.Track) {
  if (
    queue.getAllItems().find((value) => value.id === track.id) === undefined
  ) {
    queue.addItem({
      status: 'pending',
      id: track.id,
      track: track,
    });
  }
}

async function tick() {
  if (!preferences.get('ytdlp_downloaded')) {
    await downloadYTDLP();
    return;
  }

  if (
    tracksDownloading <
    preferences.get('preferences.parallelDownloadingLimit', 2)
  ) {
    const item = queue
      .getAllItems()
      .filter((item) => item.status === 'pending')
      .at(0) as (SPDL.Queue.ItemPending & SPDL.Queue.BaseItem) | undefined;

    if (item) {
      tracksDownloading++;
      console.log(`${tracksDownloading}| downloading track ${item.track.name}`);
      downloadTrack(item.track)
        .then(() => {
          console.log(
            `${tracksDownloading}| downloaded track ${item.track.name}`
          );
        })
        .catch((error) => {
          console.log(
            `${tracksDownloading}| error | ${item.track.name} | ${error}`
          );
          queue.updateItem(item.id, {
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
