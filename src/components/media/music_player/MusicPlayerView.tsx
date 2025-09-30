import "./MusicPlayerView.css"
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
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
import {commands} from "@/bindings.ts"
import toast from "react-hot-toast";
// import {useDroppable} from "@dnd-kit/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { listen } from "@tauri-apps/api/event";

const MUSIC_PLAYER_LATEST_PLAYLIST = 'music-player.playlist.latest.json'
const MUSIC_PLAYER_SETTING = 'music-player.setting.json'

export default function MusicPlayerView() {
  const [ready, setReady] = useState(false);
  // const [setting, setSetting] = useState<MusicPlayerSetting | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI>(null);
  // const { setNodeRef } = useDroppable({ id: "music-dropzone" });
  const {
    playList, appendPlayList, removePlayList, shufflePlayList, natsortPlayList, setPlayList,
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
    volume, setVolume, changeVolume,
    duration, currentTime, setCurrentTime, changeCurrentTime,
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
    commands.appReadToString(MUSIC_PLAYER_SETTING).then((result) => {
      if (result.status === 'ok'){
        const setting: MusicPlayerSetting = JSON.parse(result.data);
        setPlayPath(setting.playPath);
        setVolume(setting.volume);
        setCurrentTime(setting.currentTime);

        // changeVolume(setting.volume);
        // changeCurrentTime(setting.currentTime);
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
          loadJson(result.data).then();
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
          toast.success("Success save");
        } else {
          toast.error("Fail save");
        }
      })
    })
  }

  const clickRemovePlayList = () => {
    if (selectedPlayList.length == 0) { return }
    const newPlayList = removePlayList(selectedPlayList);
    setSelectedPlayList([])
    setSelectionBegin(null)
  }

  const clickTogglePlay = async () => {
    setAutoPlay(paused);
    togglePlay().then(() => {
      // if (playPath != null) {
      //   commands.appWriteToString(MUSIC_PLAYER_SETTING, JSON.stringify({playPath, volume, currentTime}, null, 2)).then((result) => {
      //     if (result.status === 'ok'){
      //       console.log("Success save status");
      //     } else {
      //       console.log("Fail save status");
      //     }
      //   })
      // }
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
    let newPlayList: string[] = []
    if (e.target.checked) {
      newPlayList = [...playList]
    }
    setSelectedPlayList(newPlayList)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('handleDrop');
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    let files: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      let file = fileList.item(i) as any;
      if (file !== null) {
        files.push(file.name);
      }
    }
    console.log(files);
    if (files.length > 0) {
      appendPlayList(files);
    }
  }
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (shuffle) {
      shufflePlayList()
    } else {
      natsortPlayList()
    }
  }, [shuffle])

  useEffect(() => {
    if (ended) {
      setEnded(false);
      if (playList.length == 0) {
        return;
      }
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
    if (playPath === null) {
      return;
    }
    commands.appWriteToString(MUSIC_PLAYER_SETTING, JSON.stringify({playPath, volume, currentTime}, null, 2)).then((result) => {
      if (result.status === 'ok'){
        console.log("Success save status");
      } else {
        console.log("Fail save status");
      }
    })
  }, [playPath, currentTime, volume])

  useEffect(() => {
    if (!ready) return;
    const content = JSON.stringify(playList, null, 2);
    commands.appWriteToString(MUSIC_PLAYER_LATEST_PLAYLIST, content).then((result) => {
      if (result.status === 'ok'){
        console.log("Success Saved latest playlist");
      } else {
        console.log("Fail Saved latest playlist");
      }
    })
  }, [playList])

  useEffect(() => {
    if (listRef?.current !== null) {
      setPlayListRef(listRef.current);
    }
  }, [listRef?.current])

  // useEffect(() => {
  //   if (containerRef?.current !== null) {
  //     setNodeRef(containerRef.current)
  //   }
  // }, [containerRef?.current])

  useEffect(() => {
    containerRef.current?.focus();
    commands.appReadToString(MUSIC_PLAYER_LATEST_PLAYLIST).then((result) => {
      if (result.status === 'ok'){
        loadJson(result.data).then(()=>{
          setReady(true);
        });
      }
    })

    // let unlisten: (() => void) | undefined;
    // const webview = getCurrentWebview();
    //
    // webview.onDragDropEvent((event) => {
    //   console.log("DragDropEvent:", event);
    // }).then((fn) => (unlisten = fn));
    //
    // return () => {
    //   if (unlisten) unlisten();
    // };

    // let unlisten: (() => void) | undefined;
    //
    // const setupDragDrop = async () => {
    //   const webview = await getCurrentWebview();
    //   console.log("!!!!!")
    //   unlisten = await webview.onDragDropEvent((event) => {
    //     console.log("hello")
    //     if (event.payload.type === "over") {
    //       console.log("User hovering", event.payload.position);
    //     } else if (event.payload.type === "drop") {
    //       console.log("User dropped", event.payload.paths); // full path array
    //     } else {
    //       console.log("File drop cancelled");
    //     }
    //   });
    // };
    //
    // setupDragDrop();
    // return () => {
    //   if (unlisten) unlisten();
    // };

    // let unlistenPromise: Promise<() => void> | null = null;
    //
    // const init = async () => {
    //   const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
    //     if (event.payload.type === 'over') {
    //       console.log('User hovering', event.payload.position);
    //     } else if (event.payload.type === 'drop') {
    //       console.log('User dropped', event.payload.paths);
    //       // const paths = event.payload.paths;
    //       // videoControl.addPlayFiles(paths);
    //
    //     } else {
    //       console.log('File drop cancelled');
    //     }
    //   });
    //   unlistenPromise = Promise.resolve(unlisten);
    // };
    //
    // init().then(() => {});
    //
    // // cleanup
    // return () => {
    //   if (unlistenPromise) {
    //     unlistenPromise.then((unlisten) => unlisten());
    //   }
    // };

    // const unlisten = listen<string[]>("file-dropped", (event) => {
    //   console.log("Full paths from Rust:", event.payload);
    // });
    //
    // return () => {
    //   unlisten.then(fn => fn());
    // };

  }, [])

  return (
    <div className={`widget music-player`}
         ref={containerRef}
         id="music-dropzone"
         onKeyDown={onKeyDownHandler} tabIndex={0}
         // onDrop={handleDrop}
         // onDragOver={handleDragOver}
    >
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

