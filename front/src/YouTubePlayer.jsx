import React, { useEffect, useRef }  from 'react';
import YouTube from 'react-youtube';

function YouTubePlayer({ videoId, onPlayerReady }) {
  console.log("유튜브 플레이어에서 받은 비디오 아이디는: ", videoId);
  const vinylNoiseRef = useRef(new Audio("/musics/vinyl_noise.mp3"));

  const opts = {
    height: '10',
    width: '10',
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

  useEffect(() => {
    const vinylNoise = vinylNoiseRef.current;
    vinylNoise.loop = true; // 🔄 LP 소리를 무한 반복
    vinylNoise.volume = 0.4; // 🔊 기본 볼륨 설정 (0.0 ~ 1.0)

    return () => {
      vinylNoise.pause(); // 컴포넌트 언마운트 시 LP 소리 정지
    };
  }, []);

  // 🎵 유튜브 비디오 재생/정지에 따라 LP 소리도 조절
  const handleStateChange = (event) => {
    const playerState = event.data;
    const vinylNoise = vinylNoiseRef.current;

    if (playerState === 1) {
      // 🎵 비디오가 재생되면 LP 소리도 재생
      vinylNoise.play();
    } else if (playerState === 2 || playerState === 0) {
      // ⏸️ 비디오가 일시정지되거나 끝나면 LP 소리도 멈춤
      vinylNoise.pause();
    }
  };


  return <YouTube videoId={videoId} opts={opts} onReady={handleReady} onStateChange={handleStateChange}/>;
}

export default YouTubePlayer;