import React from 'react';
import YouTube from 'react-youtube';

function YouTubePlayer({ videoId, onPlayerReady }) {
  console.log("유튜브 플레이어에서 받은 비디오 아이디는: ", videoId);
  const opts = {
    height: '10',
    width: '010',
    playerVars: {
      autoplay: 0,
      controls: 1
    },
  };

  const handleReady = (event) => {
    console.log("YouTube Player Ready!", event.target);

    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  };
  return <YouTube videoId={videoId} opts={opts} onReady={handleReady} />;
}

export default YouTubePlayer;