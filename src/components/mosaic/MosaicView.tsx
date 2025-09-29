import './MosaicView.css'
import {JSX, useEffect} from "react";
import AboutView from "../AboutView.tsx";
import HelpView from "../HelpView.tsx";
import {DefaultToolbarButton, Mosaic, MosaicWindow} from "react-mosaic-component";
import 'react-mosaic-component/react-mosaic-component.css'
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import {WinKey, WinType, getWinType, useMosaicStore} from "./mosaicStore.ts";

interface TitleInfo {
  title: string,
  icon: JSX.Element,
  view: JSX.Element,
}

const ELEMENT_MAP: Record<WinType, TitleInfo> = {
  "about": {
    title: "About",
    icon: <div />,
    view: <AboutView/>
  },
  "help": {
    title: "Help",
    icon: <div />,
    view: <HelpView/>
  },
  "music-player": {
    title: "Music Player",
    icon: <div />,
    view: <HelpView/>
  },
  "movie-player": {
    title: "Movie Player",
    icon: <div />,
    view: <HelpView/>
  },
  "monaco": {
    title: "Monaco Editor",
    icon: <div />,
    view: <HelpView/>
  },
  "md": {
    title: "MdEditor",
    icon: <div />,
    view: <HelpView/>
  },
  // "music_player": {
  //   title: "Music Player",
  //   icon: <div><Icon icon={faMusic} /></div>,
  //   view: <MusicPlayerView/>
  // }
}

export function MosaicView() {
  const {
    minimizeView, maximizeView, removeView,
    mosaicValue, setMosaicValue,
  } = useMosaicStore();

  useEffect(() => {
    setMosaicValue("about")
  }, [])

  return (
    <Mosaic<WinKey>
      value={mosaicValue}
      onChange={setMosaicValue}
      renderTile={(id, path) => (
        <MosaicWindow<WinKey>
          path={path}
          title={id}
          renderToolbar={()=> (
            <div className="title-bar">
              <div className="title">
                {ELEMENT_MAP[getWinType(id)].icon}<div>{ELEMENT_MAP[getWinType(id)].title}</div>
              </div>
              <div className="controls">
                <DefaultToolbarButton
                  title="Minimize"
                  onClick={() => minimizeView(id)}
                  className="bp6-icon-minus"
                />
                <DefaultToolbarButton
                  title="Maximize"
                  onClick={() => maximizeView(id)}
                  className="bp6-icon-maximize"
                />
                <DefaultToolbarButton
                  title="Close Window"
                  onClick={() => removeView(id)}
                  className="mosaic-default-control bp6-button bp6-minimal close-button bp6-icon-cross"
                />
              </div>
            </div>
          )}
        >
          {ELEMENT_MAP[getWinType(id)].view}
        </MosaicWindow>
      )}
      className="mosaic-blueprint-theme"
      blueprintNamespace="bp6"
    />
  )
}