import { SPDL } from 'app/types';
import { defineStore } from 'pinia';

export const useQueueStore = defineStore('queue', {
  state: () => ({
    items: [] as SPDL.Queue.Item[],
  }),
});
