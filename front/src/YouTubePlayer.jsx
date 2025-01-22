import React from 'react';
import YouTube from 'react-youtube';

function YouTubePlayer({ videoId, onPlayerReady }) {
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