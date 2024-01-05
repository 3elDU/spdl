import { SPDL } from 'app/types';

type QueueUpdateCallback = (queue: SPDL.Queue.Item[]) => void;

export default class Queue {
  private items: SPDL.Queue.Item[];
  private callbacks: QueueUpdateCallback[];

  constructor() {
    this.items = [];
    this.callbacks = [];
  }

  addItem(item: SPDL.Queue.Item) {
    this.items.push(item);
    for (const callback of this.callbacks) {
      callback(this.items);
    }
  }

  // Prefere to use this function to update existing items, as it also calls the callbacks
  updateItem(id: string, newItem: SPDL.Queue.ItemData) {
    const idx = this.items.findIndex((item) => item.id === id);
    if (idx === -1) {
      return;
    }

    this.items[idx] = {
      ...newItem,
      // Do not allow to overwrite the ID
      id: this.items[idx].id,
      track: this.items[idx].track,
    };
    for (const callback of this.callbacks) {
      callback(this.items);
    }
  }

  getItem(id: string): SPDL.Queue.Item | undefined {
    return queue.items.find((item) => item.id === id);
  }

  getAllItems(): SPDL.Queue.Item[] {
    return this.items;
  }

  deleteItem(id: string) {
    const idx = this.items.findIndex((item) => item.id === id);
    if (idx === -1) {
      return;
    }

    queue.items.splice(idx, 1);
    for (const callback of this.callbacks) {
      callback(this.items);
    }
  }

  attachCallback(callback: QueueUpdateCallback): void {
    this.callbacks.push(callback);
  }
}

export const queue = new Queue();
