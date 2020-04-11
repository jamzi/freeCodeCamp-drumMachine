import * as React from "react";

import "./reset.css";
import "./styles.css";
import { padElements } from "./constants/padElements";
import PadElement from "./models/padElement";

export default function App() {
  const [playingAudio, setPlayingAudio] = React.useState<PadElement>();
  const [volume, setVolume] = React.useState<number>(100);

  const timeoutTimer = React.useRef<number | undefined>();

  const playAudio = React.useCallback((audioId: string) => {
    resetPreviousPlayingAudio();
    handleSetPlayingAudio(audioId);

    const audioEl = document.getElementById(audioId)  as HTMLAudioElement | null
    if (audioEl) {
      audioEl.play();
    }
  }, []);

  const handleKeyDown = React.useCallback(
		({ key }: KeyboardEvent) => {
      playAudio(key.toUpperCase());
		},
		[playAudio]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  React.useEffect(() => {
    const audioEl= playingAudio && document.getElementById(playingAudio.id)  as HTMLAudioElement | null
    if (audioEl) {
      audioEl.volume = volume / 100
    }
  }, [playingAudio, volume])

  const handleSetPlayingAudio = (audioId: string) => {
    const playingAudio = padElements.find(element => element.id === audioId);
    if (!playingAudio) {
      return;
    }
    if (timeoutTimer.current) {
      clearTimeout(timeoutTimer.current)
    }
    setPlayingAudio(playingAudio);
    timeoutTimer.current = setTimeout(() => {
      setPlayingAudio(undefined)
    }, 2 * 1000)
  };

  const resetPreviousPlayingAudio = () => {
    padElements.forEach(element => {
      const ref = document.getElementById(element.id) as HTMLAudioElement | null
      if (ref) {
        ref.pause();
        ref.currentTime = 0;
      }
    });
  };

  const handleSetVolume = (e: React.ChangeEvent<HTMLInputElement>)=> {
    const volume = e?.target?.value
    if (volume) {
      setVolume(parseInt(volume, 10))
    }
  };

  return (
    <div id="drum-machine">
      <div id="pad-elements">
        {padElements.map(element => (
          <button
            key={element.id}
            id={element.buttonId}
            className={`drum-pad ${element.id === playingAudio?.id ? 'active': ''}`}
            onClick={() => playAudio(element.id)}
          >
            <span>{element.id}</span>
            <audio id={element.id} className="clip" src={element.audioSrc} />
          </button>
        ))}
      </div>
      <div id="pad-additional-controls">
        <p>Tune:</p>
        <div id="display">{(playingAudio && playingAudio.description) || 'Drum Machine'}</div>
        <div id="volume">
          <p>Volume:</p>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleSetVolume}
          />
        </div>
      </div>
    </div>
  );
}
