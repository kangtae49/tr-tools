import {create} from "zustand/react";
import natsort from "natsort";
import {type ListImperativeAPI} from 'react-window';

export interface MusicPlayerSetting {
  playPath: string;
  currentTime: number;
  volume: number;
}

interface MusicPlayListStore {
  playListRef: ListImperativeAPI | null;
  playList: string[];
  playPath: string | null;

  setPlayListRef: (value: ListImperativeAPI | null) => void;
  setPlayList: (value: string[]) => void;
  setPlayPath: (value: string | null) => void;

  appendPlayList: (value: string[]) => void;
  removePlayList: (value: string[]) => string [];
  shufflePlayList: () => string [];
  natsortPlayList: () => string [];
  prevPlayPath: () => string | null;
  nextPlayPath: () => string | null;
  getPrev: (value: string | null) => string | null;
  getNext: (value: string | null) => string | null;

  scrollPlayPath: (value: string) => void;

}

export const useMusicPlayListStore = create<MusicPlayListStore>((set, get) => ({
  playListRef: null,
  playList: [],
  playPath: null,

  setPlayListRef: (value) => set({ playListRef: value }),
  setPlayList: (value) => set({ playList: value }),
  setPlayPath: (value) => set({ playPath: value }),

  appendPlayList: (value) => {
    const newPlayList = [...new Set([...get().playList, ...value])];
    set({ playList: newPlayList})
  },
  removePlayList: (value) => {
    const newPlayList = get().playList?.filter(v => !value.includes(v));
    set({ playList: newPlayList})
    return newPlayList;
  },
  shufflePlayList: () => {
    const arr = [...get().playList];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    set({ playList: arr });
    return arr
  },
  natsortPlayList: () => {
    const sorter = natsort();
    const arr = [...get().playList].sort(sorter);
    set({ playList: arr });
    return arr
  },
  prevPlayPath: () => {
    const curPlayList = get().playList;
    if (curPlayList.length == 0) {
      return null;
    }
    let prev: string | null;
    const curPlayPath = get().playPath;
    if (curPlayPath == null) {
      prev = curPlayList[0];
      set({ playPath: prev });
      return prev;
    }
    let idx = curPlayList.indexOf(curPlayPath) -1;
    if (idx < 0) {
      idx = curPlayList.length - 1;
    }
    prev = curPlayList[idx]
    set({ playPath: prev });
    return prev;
  },
  nextPlayPath: () => {
    const curPlayList = get().playList;
    if (curPlayList.length == 0) {
      return null;
    }
    let next: string | null;
    const curPlayPath = get().playPath;
    if (curPlayPath == null) {
      next = curPlayList[0];
      set({ playPath: next });
      return next;
    }
    let idx = curPlayList.indexOf(curPlayPath) +1;
    if (idx > curPlayList.length -1) {
      idx = 0;
    }
    next = curPlayList[idx]
    set({ playPath: next });
    return next;
  },
  getPrev: (value) => {
    const curPlayList = get().playList;
    if (curPlayList.length == 0) {
      return null;
    }
    let prev: string | null;
    if (value == null) {
      prev = curPlayList[0];
      return prev
    }
    let idx = curPlayList.indexOf(value) -1;
    if (idx < 0) {
      idx = curPlayList.length - 1;
    }
    prev = curPlayList[idx]
    return prev;
  },
  getNext: (value) => {
    const curPlayList = get().playList;
    if (curPlayList.length == 0) {
      return null;
    }
    let next: string | null;
    if (value == null) {
      next = curPlayList[0];
      set({ playPath: next });
      return next;
    }
    let idx = curPlayList.indexOf(value) +1;
    if (idx > curPlayList.length -1) {
      idx = 0;
    }
    next = curPlayList[idx]
    return next;
  },
  scrollPlayPath: (value: string) => {
    const curPlayList = get().playList;
    const listRef = get().playListRef;
    const idx = curPlayList.indexOf(value);
    if (idx >= 0) {
      listRef?.scrollToRow({align:"auto", behavior: "auto", index: idx});
    }
  }
}));
