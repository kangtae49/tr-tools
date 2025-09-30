import {ChangeEvent} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faMusic,
} from '@fortawesome/free-solid-svg-icons'
import { type RowComponentProps } from "react-window";
import {getFilename} from "@/components/utils.ts";
import {useMusicPlayListStore} from "./musicPlayListStore.ts";
import {useSelectedMusicPlayListStore} from "./selectedMusicPlayListStore.ts";
import {useAudioStore} from "../mediaStore.ts";
export default function MusicPlayListRowView({
                           index,
                           playList,
                           style
                         }: RowComponentProps<{
  playList: string[];
}>) {
  const {paused, setAutoPlay} = useAudioStore();
  const {removePlayList, playPath, setPlayPath} = useMusicPlayListStore();
  const {
    selectedPlayList, setSelectedPlayList, appendSelectedPlayList, removeSelectedPlayList,
  } = useSelectedMusicPlayListStore();



  const clickPlayPath = (path: string) => {
    window.getSelection()?.removeAllRanges();
    setSelectedPlayList([]);

    if (paused) {
      setAutoPlay(true);
    }
    setPlayPath(path);
  }

  const onChangeChecked = (e: ChangeEvent<HTMLInputElement>, path: string) => {
    const checked = e.target.checked;
    if (checked) {
      appendSelectedPlayList([path]);
    } else {
      removeSelectedPlayList([path]);
    }
  }

  const isPlayPath = playPath == playList[index];
  const isSelected = selectedPlayList.includes(playList[index]);

  return (
    <div className={`row ${isSelected ? 'selected': ''}`} style={style}>
      <div className={`title  ${(!paused && isPlayPath) ? 'playing' : ''}`}
           title={playList[index]}
      >
        <div><input type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onChangeChecked(e, playList[index])}
        />
        </div>
        {isPlayPath && <div><Icon icon={faMusic}/></div>}
        <div title={playList[index]} onClick={() => clickPlayPath(playList[index])}>
          {getFilename(playList[index])}
        </div>
      </div>
      <div
        onClick={() => removePlayList([playList[index]])}
      >
        <Icon icon={faCircleXmark} />
      </div>
    </div>
  );
}

/*
onClick={(e) => handleClick(e, playList[index])}

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, item: string) => {
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
    if (!e.shiftKey) {
      setSelectionBegin(item);
    }

    let selection: string[] = [];
    let begin = 0;
    let end = 0;
    if (e.shiftKey) {
      if (selectionBegin === null) {
        return;
      }
      begin = playList.indexOf(selectionBegin);
      end = playList.indexOf(item);
      selection = playList.slice(Math.min(begin, end), Math.max(begin, end) + 1);
    } else {
      selection = [item]
    }

    if (selection.length == 0) {
      return;
    }

    if (e.ctrlKey) {
      if (selection.length == 1) {
        if (selectedPlayList.includes(selection[0])) {
          removeSelectedPlayList(selection);
        } else {
          appendSelectedPlayList(selection);
        }
      } else {
        if (selectedPlayList.includes(playList[begin])) {
          appendSelectedPlayList(selection);
        } else {
          removeSelectedPlayList(selection);
        }
      }
    } else {
      if (selection.length == 1) {
        setSelectedPlayList(selection);
      } else {
        if (selectedPlayList.includes(playList[begin])) {
          setSelectedPlayList(selection);
        } else {
          removeSelectedPlayList(selection);
        }
      }
    }

  };

 */