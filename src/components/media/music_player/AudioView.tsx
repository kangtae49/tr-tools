import {useEffect, useRef} from "react";
import {useAudioStore} from "../mediaStore.ts";
import {useMusicPlayListStore} from "./musicPlayListStore.ts";


function AudioView() {
  const {playPath} = useMusicPlayListStore();
  const ref = useRef<HTMLAudioElement | null>(null);
  const {
    mediaRef, setMediaRef,
    autoPlay,
    setDuration,
    setCurrentTime,
    volume, setVolume, changeVolume,
    play,
    pause, setPaused,
    muted, setMuted, changeMuted,
    setPlaybackRate,
    setEnded,
  } = useAudioStore();


  const onloadedMetaData = () => {
    if (!mediaRef?.current) return;
    changeVolume(volume);
    changeMuted(muted);
    console.log('autoPlay', autoPlay);
    if (autoPlay) {
      play();
    } else {
      pause();

    }

    setDuration(mediaRef.current.duration);
  }
  const onTimeUpdate = () => {
    if (!mediaRef?.current) return;
    setCurrentTime(mediaRef.current.currentTime);
  }

  const onVolumeChange = () => {
    if (!mediaRef?.current) return;
    setVolume(mediaRef.current.volume);
    setMuted(mediaRef.current.muted);
  }
  const onRateChange = () => {
    if (!mediaRef?.current) return;
    setPlaybackRate(mediaRef.current.playbackRate)
  }
  const onPlay = () => {
    setPaused(false);
  }
  const onPause = () => {
    setPaused(true);
  }

  const onEnded = () => {
    setPaused(true);
    setEnded(true);
  }


  useEffect(() => {
    if (ref === null) return;

    setMediaRef(ref);
  }, [playPath])

  useEffect(() => {
    if (!mediaRef?.current) return;

    // audioRef.current.volume = 0.5;
    mediaRef.current.addEventListener("loadedmetadata", onloadedMetaData);
    mediaRef.current.addEventListener("timeupdate", onTimeUpdate);
    mediaRef.current.addEventListener("volumechange", onVolumeChange);
    mediaRef.current.addEventListener("ratechange", onRateChange);
    mediaRef.current.addEventListener("play", onPlay);
    mediaRef.current.addEventListener("pause", onPause);
    mediaRef.current.addEventListener("ended", onEnded);


    return () => {
      mediaRef?.current?.removeEventListener("loadedmetadata", onloadedMetaData);
      mediaRef?.current?.removeEventListener("timeupdate", onTimeUpdate);
      mediaRef.current?.removeEventListener("volumechange", onVolumeChange);
      mediaRef.current?.removeEventListener("ratechange", onRateChange);
      mediaRef.current?.removeEventListener("play", onPlay);
      mediaRef.current?.removeEventListener("pause", onPause);
      mediaRef.current?.removeEventListener("ended", onEnded);
    };

  }, [playPath, mediaRef])

  if (playPath === null) return;
  return (
    <div className="audio-player">
      <audio key={playPath} ref={ref} controls autoPlay={false}>
        <source src={`http://local.localhost/file/${encodeURIComponent(playPath)}`} />
      </audio>
    </div>
  )
}

export default AudioView