import { Sound } from "react-sound";
import { fetchTrackBySlug, ITrack } from "@spinamp/spinamp-sdk";
import { FC, useState } from "react";

// fetchTrackBySlug("Way Of The DAO").then((track: ITrack | null) => {
//   console.log(track);
// });

interface SpinampPlayerProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

const SpinampPlayer: FC<SpinampPlayerProps> = ({ ...props }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundStatus, setSoundStatus] = useState(Sound.status.STOPPED);
  const toggle = () => {
    setIsPlaying(
      setSoundStatus(() => {
        if (soundStatus === Sound.status.PLAYING) {
          const isPlaying = Sound.status.PAUSED;
          return isPlaying;
        } else {
          const isPlaying = Sound.status.PLAYING;
          return isPlaying;
        }
      })
    );
  };
  // const trackUrl = fetchTrackBySlug("Way Of The DAO").lossyAudioUrl;
  // .then(
  // (track: ITrack.lossyAudioUrl | null) => {
  //   console.log(track);
  // }
  // );
  return (
    <div>
      <Sound
        url="https://storageapi.fleek.co/iggyiccy-team-bucket/metabolismcv/bg_music.mp3"
        playStatus={soundStatus}
        autoload={true}
        loop={true}
      />
      <div
        className="header--brand flex row-direction icons"
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          padding: 20,
        }}
        onClick={toggle}
      >
        <img
          src="https://storageapi.fleek.co/iggyiccy-team-bucket/metabolismcv/icon_sound.png"
          alt="music"
        />
      </div>
    </div>
  );
};

export default SpinampPlayer;
