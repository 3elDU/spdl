import { SPDL } from 'app/types';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { toRaw } from 'vue';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    history: [] as SPDL.Track[],
    // Storing currently played track as index inside the history array
    // Thus, history can be traversed forward and backward, easily
    idx: 0,
    // Whether the audio data itself was loaded into the <audio> element
    loaded: false,

    // This variable is used to persist the currentTime for the track.
    // When the track is loaded, this variable is checked, and if it is set,
    // track's currentTime is set from ours currentTime.
    initialLoad: true,

    paused: true,
    volume: 1.0,
    currentTime: 0.0,
    // reference to <audio> element is set from the player component
    audio: undefined as HTMLAudioElement | undefined,
  }),
  persist: {
    paths: ['history', 'idx', 'volume', 'currentTime'],
  },

  getters: {
    // Returns currently playing track
    track(): SPDL.Track | undefined {
      return this.history.at(this.idx);
    },

    // Whether do we have remaining tracks in the queue
    hasNextItems(): boolean {
      return this.history.length > this.idx + 1;
    },
    // Returns the amount of items remaining in the queue
    countNextItems(): number {
      return this.history.length - (this.idx + 1);
    },
    // Whether do we have previously played tracks in the history
    hasPreviousItems(): boolean {
      return this.idx > 0;
    },
    // Returns the amount of previously played tracks in history
    countPreviousItems(): number {
      return this.idx;
    },
  },

  actions: {
    async playTrack(track: SPDL.Track) {
      if (this.audio === undefined) {
        return;
      }

      // If currently played track ID is the same as requested track id,
      // just resume the playback
      if (this.loaded && this.track?.id === track.id) {
        await this.play();
        return;
      }

      const base64 = await window.ipc.loadAudioFile(toRaw(track));
      if (base64 === undefined) {
        if (this.track) {
          this.history.splice(this.idx, 1);
        }
        Notify.create({
          type: 'negative',
          message: 'Failed to load the track from disk',
        });
        return;
      }

      this.audio.src = 'data:audio/mp3;base64,' + base64;
      this.loaded = true;

      // If the store was just loaded from localStorage, and there was currentTime set, restore it
      if (this.initialLoad && this.track?.id === track.id) {
        this.audio.currentTime = this.currentTime;
        this.initialLoad = false;
      }

      // Add track to history, if the function was called externally
      this.history[this.idx] = track;
      await this.play();
    },
    async playFromIndex(idx: number) {
      const track = this.history.at(idx);
      if (track) {
        this.idx = idx;
        this.loaded = false;
        this.currentTime = 0;
        this.playTrack(track);
      }
    },
    async playNextFromQueue() {
      if (!this.hasNextItems) {
        this.audio?.pause();
        return;
      }

      this.idx++;
      this.loaded = false;
      if (this.track) {
        await this.playTrack(this.track);
      }
    },
    async playPrevious() {
      if (!this.hasPreviousItems) {
        return;
      }

      this.idx--;
      this.loaded = false;
      if (this.track) {
        await this.playTrack(this.track);
      }
    },

    async play() {
      await this.audio?.play();
      this.paused = false;
    },
    addToQueue(track: SPDL.Track) {
      this.history.push(track);
      console.log(this.idx, this.history, this.hasNextItems);
    },
    removeFromQueue(index: number) {
      const track = this.history.at(index);

      if (track && this.idx !== index) {
        // Update current track's index
        if (this.idx > index) {
          this.idx--;
        }
        this.history.splice(index, 1);
      }
    },
    async pause() {
      this.audio?.pause();
      this.paused = true;
    },
    async togglePause() {
      if (this.paused) {
        if (this.track && !this.loaded) {
          await this.playTrack(this.track);
        } else {
          await this.audio?.play();
        }
        this.paused = false;
      } else {
        this.audio?.pause();
        this.paused = true;
      }
    },

    clearQueue() {
      if (!this.hasNextItems) {
        return;
      }

      this.history.splice(this.idx + 1);
    },
    clearHistory() {
      if (!this.hasPreviousItems) {
        return;
      }

      const elementsToRemove = this.idx;
      this.history.splice(0, elementsToRemove);
      this.idx -= elementsToRemove;
    },

    setVolume(volume: number) {
      this.volume = volume;
      if (this.audio) {
        this.audio.volume = volume;
      }
    },
    setTime(time: number) {
      if (this.audio) {
        this.audio.currentTime = time;
        this.currentTime = time;
      }
    },
  },
});
