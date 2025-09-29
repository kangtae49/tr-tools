import {create} from "zustand/react";
import {MosaicNode} from "react-mosaic-component";


export type AboutKey = 'about'
export type HelpKey = 'help'
export type MusicPlayerKey = 'music-player'
export type MoviePlayerKey = 'movie-player'
export type MonacoKey = 'monaco'
export type MdKey = 'md'
export type MonacoPathKey = `${MonacoKey}-${string}`
export type MdPathKey = `${MdKey}-${string}`

export type WinKey =
  | AboutKey
  | HelpKey
  | MusicPlayerKey
  | MoviePlayerKey
  | MonacoPathKey
  | MdPathKey

export type WinType =
  | AboutKey
  | HelpKey
  | MusicPlayerKey
  | MoviePlayerKey
  | MonacoKey
  | MdKey

export function getWinPath(key: WinKey): string | null {

  if (key.startsWith("monaco-")) {
    return key.slice("monaco-".length);
  }
  if (key.startsWith("md-")) {
    return key.slice("md-".length);
  }
  return null;
}

export function getWinType(key: WinKey): WinType {
  if (key.startsWith("monaco-")) {
    return "monaco";
  }
  if (key.startsWith("md-")) {
    return "md";
  } else {
    return key as WinType
  }
}





interface MosaicStore {
  mosaicValue: MosaicNode<WinKey> | null;
  setMosaicValue: (value: MosaicNode<WinKey> | null) => void;
  addView: (id: WinKey) => void;
  removeView: (id: WinKey) => void;
  maximizeView: (id: WinKey) => void;
  minimizeView: (id: WinKey) => void;
}

export const useMosaicStore = create<MosaicStore>((set, get) => ({
  mosaicValue: null,
  setMosaicValue: (value) => set({ mosaicValue: value }),
  addView: (id: WinKey) => {
    console.log("addView", id);
    const current = get().mosaicValue;
    if (!current) {
      set({ mosaicValue: id });
      return;
    }

    const collectIds = (node: MosaicNode<WinKey> | null): WinKey[] => {
      if (!node) return [];
      if (typeof node === 'string') return [node];
      return [...collectIds(node.first), ...collectIds(node.second)];
    };
    const existingIds = collectIds(current);

    if (!existingIds.includes(id)) {
      set({
        mosaicValue: {
          direction: 'row',
          first: id,
          second: current,
        }
      });
      return;
    }

    const updateSplit = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;
      console.log("updateSplit", node);

      if (typeof node === "string") {
        return node;
      }

      const first = updateSplit(node.first);
      const second = updateSplit(node.second);
      if (first === null || second === null) return node;

      if ((node.splitPercentage === 0 && first === id) || (node.splitPercentage === 100 && second === id)) {
        return { ...node, splitPercentage: 50, first, second };
      }

      return {...node, first, second}
    };
    set({ mosaicValue: updateSplit(current) });

  },
  removeView: (id: WinKey) => {
    const removeNode = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;
      if (typeof node === 'string') {
        return node === id ? null : node;
      }
      const first = removeNode(node.first);
      const second = removeNode(node.second);

      if (!first && !second) return null;
      if (!first) return second;
      if (!second) return first;

      return { ...node, first, second };
    };

    const newValue = removeNode(get().mosaicValue);
    set({ mosaicValue: newValue });
  },
  maximizeView: (id: WinKey) => {
    const updateSplit = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;

      if (typeof node === "string") {
        return node;
      }

      const first = updateSplit(node.first);
      const second = updateSplit(node.second);

      if (!first && !second) return null;
      if (!first) return second;
      if (!second) return first;

      if (first === id) {
        return { ...node, splitPercentage: 100, first, second };
      } else if(second === id) {
        return { ...node, splitPercentage: 0, first, second };
      }

      return { ...node, first, second };
    };

    set({ mosaicValue: updateSplit(get().mosaicValue) });
  },

  minimizeView: (id: WinKey) => {
    const updateSplit = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;

      if (typeof node === "string") {
        return node;
      }

      const first = updateSplit(node.first);
      const second = updateSplit(node.second);

      if (!first && !second) return null;
      if (!first) return second;
      if (!second) return first;

      if (first === id) {
        return { ...node, splitPercentage: 0, first, second };
      } else if(second === id) {
        return { ...node, splitPercentage: 100, first, second };
      }

      return { ...node, first, second };
    };

    set({ mosaicValue: updateSplit(get().mosaicValue) });
  },

}));


