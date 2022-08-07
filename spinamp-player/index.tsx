import ReactSound, { ReactSoundProps } from "react-sound";
import { ICollectionTrack, useCollectionQuery } from "@spinamp/spinamp-hooks";
import { FC, useState } from "react";

const SpinampPlayer = () => {
  const [soundStatus, setSoundStatus] =
    useState<ReactSoundProps["playStatus"]>("PLAYING");
  const toggle = () => {
    setSoundStatus((status: string) =>
      status === "STOPPED" ? "PLAYING" : "STOPPED"
    );
  };
  const { collection } = useCollectionQuery(
    "0x267aC7fda523066DA091a1A34826179B202f6081"
  );
  return (
    <div>
      {collection.map((track) => (
        <ReactSound
          key={track.id}
          url={track.lossyAudioUrl}
          playStatus={soundStatus}
          autoLoad={false}
          loop={true}
        />
      ))}
      <div
        className="bottom-0 left-0 absolute px-5 py-5 z-500"
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
