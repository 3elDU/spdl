import { defineStore } from 'pinia';

export const useQueueStore = defineStore('queue', {
  state: () => ({
    items: [] as QueueItem[],
  }),
});
