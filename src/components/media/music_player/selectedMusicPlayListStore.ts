import {create} from "zustand/react";

interface SelectedMusicPlayListStore {
  selectedPlayList: string[];
  selectionBegin: string | null;
  setSelectedPlayList: (value: string[]) => void;
  setSelectionBegin: (value: string | null) => void;

  appendSelectedPlayList: (value: string[]) => void;
  removeSelectedPlayList: (value: string[]) => void;
}

export const useSelectedMusicPlayListStore = create<SelectedMusicPlayListStore>((set, get) => ({
  selectedPlayList: [],
  selectionBegin: null,

  setSelectedPlayList: (value) => set({ selectedPlayList: value }),
  setSelectionBegin: (value) => set({ selectionBegin: value }),

  appendSelectedPlayList: (value) => {
    const newSelectedPlayList = [...new Set([...get().selectedPlayList, ...value])];
    set({ selectedPlayList: newSelectedPlayList})
  },
  removeSelectedPlayList: (value) => {
    const newSelectedPlayList = get().selectedPlayList.filter(v => !value.includes(v));
    set({ selectedPlayList: newSelectedPlayList})
  }
}));
