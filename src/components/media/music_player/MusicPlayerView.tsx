import "./MusicPlayerView.css"
import React, {ChangeEvent, useEffect, useRef} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faBookMedical,
  faFolderPlus, faTrashCan,
  faCirclePlay, faCirclePause, faVolumeHigh, faVolumeMute,
  faBackwardStep, faForwardStep,
  faShuffle,
  faFloppyDisk,
  faArrowsSpin, faRotateRight, faMinus,
} from '@fortawesome/free-solid-svg-icons'
import {List,  type ListImperativeAPI} from 'react-window'
import MusicPlayListRowView from "./MusicPlayListRowView.tsx";
import AudioView from "./AudioView.tsx";
import {useMusicPlayListStore, MusicPlayerSetting} from "./musicPlayListStore.ts";
import {useSelectedMusicPlayListStore} from "./selectedMusicPlayListStore.ts";
import {useAudioStore} from "../mediaStore.ts";
import {formatSeconds, getFilename} from "@/components/utils.ts";
import { open, save } from '@tauri-apps/plugin-dialog';
// import {invoke} from "@tauri-apps/api/core";
import {commands} from "@/bindings.ts"

const MUSIC_PLAYER_LATEST_PLAYLIST = 'music-player.playlist.latest.json'
const MUSIC_PLAYER_SETTING = 'music-player.setting.json'

export default function MusicPlayerView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI>(null);

  const {
    playList, appendPlayList, removePlayList, shufflePlayList, natsortPlayList,
    playPath, setPlayPath,
    prevPlayPath, nextPlayPath,
    getPrev, getNext,
    setPlayListRef,
    scrollPlayPath,
  } = useMusicPlayListStore();
  const {
    selectedPlayList, setSelectedPlayList,
    selectionBegin, setSelectionBegin,
  } = useSelectedMusicPlayListStore();
  const {
    paused, pause, play, togglePlay,
    volume, changeVolume,
    duration, currentTime, changeCurrentTime,
    muted, changeMuted,
    repeat, toggleRepeat,
    shuffle, toggleShuffle,
    ended, setEnded,
    autoPlay, setAutoPlay,
  } = useAudioStore();


  const openDialogPlayList = async () => {
    open({
        multiple: true,
        directory: false,
        filters: [{name: "Audio files", extensions: ["mp3", "wav", "ogg", "m4a", "opus", "webm"]}]
      })
      .then((files) => {
        if (files === null) { return }
        appendPlayList(files);
        let shuffledPlayList: string[];
        if (shuffle) {
          shuffledPlayList = shufflePlayList()
        } else {
          shuffledPlayList = natsortPlayList()
        }

        setSelectedPlayList([])
        setSelectionBegin(null)
        if (playPath == null) {
          setPlayPath(shuffledPlayList[0]);
        }

        const content = JSON.stringify(shuffledPlayList, null, 2);
        commands.appWriteToString(MUSIC_PLAYER_LATEST_PLAYLIST, content).then((result) => {
          if (result.status === 'ok'){
            console.log("save(latest) success");
          } else {
            console.log("save(latest) failed");
          }
        })
      })
  }

  const loadJson = async (jsonStr: string): Promise<string []> => {

    const newList: string [] = JSON.parse(jsonStr);
    appendPlayList(newList);
    let shuffledPlayList: string[];
    if (shuffle) {
      shuffledPlayList = shufflePlayList()
    } else {
      shuffledPlayList = natsortPlayList()
    }
    console.log('playPath', playPath)
    commands.appReadToString(MUSIC_PLAYER_SETTING).then((result) => {
      if (result.status === 'ok'){
        const setting: MusicPlayerSetting = JSON.parse(result.data);
        console.log(setting)
        setPlayPath(setting.playPath);
        changeCurrentTime(setting.currentTime);
      } else {
        setPlayPath(shuffledPlayList[0]);
      }
    })

    return shuffledPlayList;
  }

  const openDialogOpenJson = async () => {
    open({
      filters: [{name: "OpenAudio Book", extensions: ["json"]}],
    }).then((file) => {
      if (file === null) return;
      commands.readToString(file).then(async (result) => {
        if (result.status === 'ok'){
          const shuffledPlayList = await loadJson(result.data);
          const shuffledContent = JSON.stringify(shuffledPlayList, null, 2);
          commands.appWriteToString(MUSIC_PLAYER_LATEST_PLAYLIST, shuffledContent).then((result) => {
            if (result.status === 'ok'){
              console.log("save(latest) success");
            } else {
              console.log("save(latest) failed");
            }
          })
        }
      })
    })
  }


  const openDialogSaveAsJson = async () => {
    save({
      filters: [{name: "Save Audio Book", extensions: ["json"]}],
    }).then((file) => {
      if(file === null) return;
      const content = JSON.stringify(playList, null, 2);
      commands.writeToString(file, content).then(async (result) => {
        if (result.status === 'ok'){
          console.log("save success");
        } else {
          console.log("save failed");
        }
      })
    })
  }

  const clickRemovePlayList = () => {
    if (selectedPlayList.length == 0) { return }
    removePlayList(selectedPlayList);
    setSelectedPlayList([])
    setSelectionBegin(null)
  }

  const clickTogglePlay = async () => {
    setAutoPlay(paused);
    await togglePlay().then(() => {
      if (playPath != null) {
        commands.appWriteToString(MUSIC_PLAYER_SETTING, JSON.stringify({playPath, currentTime})).then((result) => {
          if (result.status === 'ok'){
            console.log("save(setting) success");
          } else {
            console.log("save(setting) failed");
          }
        })
      }
    });
  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.getSelection()?.removeAllRanges();

    if (e.ctrlKey && e.key === 'a') {
      setSelectedPlayList(playList);
    } else if (e.key === "Delete") {
      clickRemovePlayList();
    } else if (e.key === "ArrowLeft") {
      const newPlayPath = prevPlayPath()
      if (newPlayPath !== null) {
        scrollPlayPath(newPlayPath)
      }
    } else if (e.key === "ArrowRight") {
      const newPlayPath = nextPlayPath()
      if (newPlayPath !== null) {
        scrollPlayPath(newPlayPath)
      }
    } else if (e.key === "ArrowUp") {
      const newSelection = getPrev(selectionBegin)
      if(newSelection !== null) {
        setSelectionBegin(newSelection)
        setSelectedPlayList([newSelection])
        scrollPlayPath(newSelection)
      }
    } else if (e.key === "ArrowDown") {
      const newSelection = getNext(selectionBegin)
      if(newSelection !== null) {
        setSelectionBegin(newSelection)
        setSelectedPlayList([newSelection])
        scrollPlayPath(newSelection)
      }
    } else if (e.key === "Enter") {
      if (selectedPlayList.length == 1) {
        if (paused) {
          setAutoPlay(true);
        }
        setPlayPath(selectedPlayList[0]);
      }
    }
  }
  const changeAllChecked = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.checked ? setSelectedPlayList(playList) : setSelectedPlayList([]);
  }

  useEffect(() => {
    if (shuffle) {
      shufflePlayList()
    } else {
      natsortPlayList()
    }
  }, [shuffle])

  useEffect(() => {
    if (ended) {
      console.log("ended");
      setEnded(false);
      if (playList.length == 0) {
        return;
      }
      console.log("repeat", repeat);
      if (repeat === 'repeat_all') {
        let nextPlay = playList[0];
        if (playPath !== null) {
          let idx = playList.indexOf(playPath);
          let shuffledPlayList = playList;
          if (shuffle && idx === playList.length -1) {
            shuffledPlayList = shufflePlayList();
          }

          if (idx < 0) {
            idx = 0;
          } else {
            idx++;
          }
          if (idx > shuffledPlayList.length - 1) {
            idx = 0;
          }
          nextPlay = shuffledPlayList[idx]
        }
        setPlayPath(nextPlay);
        if (autoPlay) {
          play();
        }
      } else if (repeat === 'repeat_one') {
        changeCurrentTime(0);
        if (autoPlay) {
          play();
        }
      } else if (repeat === 'repeat_none') {
        pause();
      }
    }
  }, [ended])

  useEffect(() => {
    if (listRef?.current !== null) {
      setPlayListRef(listRef.current);
    }
  }, [listRef?.current])

  useEffect(() => {
    containerRef.current?.focus();
    commands.appReadToString(MUSIC_PLAYER_LATEST_PLAYLIST).then((result) => {
      if (result.status === 'ok'){
        loadJson(result.data).then();
      }
    })
  }, [])

  return (
    <div className={`widget music-player`} ref={containerRef} onKeyDown={onKeyDownHandler} tabIndex={0}>
      <AudioView />
      <div className="top">
        <div className="row first">
          <div className="icon" onClick={openDialogPlayList} title="Open Audio Files"><Icon icon={faFolderPlus}/></div>
          <div className="icon" onClick={openDialogOpenJson} title="Open Audio Book"><Icon icon={faBookMedical}/></div>
          <div className="icon" onClick={openDialogSaveAsJson} title="Save Audio Book"><Icon icon={faFloppyDisk}/></div>
          <div className="icon badge-wrap" onClick={clickRemovePlayList} title="Delete Selection Files">
            <Icon icon={faTrashCan} className={selectedPlayList.length > 0 ? '': 'inactive'}/>
            {selectedPlayList.length > 0 && <div className="badge">{selectedPlayList.length}</div>}
          </div>
          <div className="center">
            <div className="icon" onClick={() => toggleShuffle()}>
              <Icon icon={faShuffle} className={shuffle ? '': 'inactive'}/>
            </div>
            <div className="icon" onClick={() => prevPlayPath()}>
              <Icon icon={faBackwardStep}/>
            </div>
            <div className="icon middle"
                 onClick={() => clickTogglePlay()}
            >
              <Icon icon={paused ? faCirclePlay : faCirclePause }/>
            </div>
            <div className="icon" onClick={() => nextPlayPath()}>
              <Icon icon={faForwardStep}/>
            </div>
            {repeat === 'repeat_all' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat All"><Icon icon={faArrowsSpin}/></div>}
            {repeat === 'repeat_one' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat One"><Icon icon={faRotateRight}/></div>}
            {repeat === 'repeat_none' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat Off"><Icon icon={faMinus}/></div>}
          </div>

          <div className="slider">
            <input type="range" min={0} max={1} step={0.01} value={volume}
                   onChange={(e) => {
                     const v = Number(e.target.value);
                     // setVolume(v);
                     changeVolume(v);
                     // if (mediaRef?.current) {
                     //   mediaRef.current.volume = v;
                     // }
                   }}/>
          </div>
          <div className="icon" onClick={() => changeMuted(!muted)}>
            <Icon icon={muted ? faVolumeMute : faVolumeHigh}/>
          </div>
        </div>
        <div className={`row second ${(!paused && playPath) ? 'playing' : ''}`}>
          <div><input type="checkbox" onChange={changeAllChecked}/></div>
          <div className="title" title={playPath ?? ''}>{getFilename(playPath ?? '')}</div>
          <div className="tm">{formatSeconds(currentTime)}</div>
          <div className="slider">
            <input type="range" min={0} max={duration} step={0.01} value={currentTime}
                   onChange={(e) => {
                     const tm = Number(e.target.value);
                     changeCurrentTime(tm);
                   }}/>
          </div>
          <div className="tm">{formatSeconds(duration)}</div>
        </div>
      </div>
      <List className="play-list"
            listRef={listRef}
            rowHeight={22}
            rowCount={playList.length}
            rowComponent={MusicPlayListRowView} rowProps={{playList}}

      />
    </div>
  )
}

