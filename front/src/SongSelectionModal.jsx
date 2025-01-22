// Modal.js
import React, { useState } from 'react'
import './SongSelectionModal.css'
import { searchYouTubeVideo } from './utils/youtubeSearch';

const SongSelectionModal = ({ isOpen, onClose, recommendedSongs, onSongSelect, onPlay }) => {
  const [currentPlaying, setCurrentPlaying] = useState(null);
  if (!isOpen) return null

  const handlePlayClick = async (song) => {
    console.log(`재생 버튼 클릭됨: ${song.title} - ${song.artist}`);

    if (currentPlaying === song.title) {
      console.log("동일한 노래 재생 중 → 정지");
      onPlay(null);
      setCurrentPlaying(null);
    } else {
      console.log("유튜브에서 영상 검색 중...");
      const videoId = await searchYouTubeVideo(song.title, song.artist);
      if (videoId) {
        console.log(`YouTube videoId 찾음: ${videoId}`);
        onPlay(videoId);
        setCurrentPlaying(song.title);
      } else {
        alert("YouTube에서 해당 노래를 찾을 수 없습니다.");
      }
    }
  };

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2>LP에 넣을 음악을 선택해 주세요!</h2>
        {recommendedSongs.map((song, index) => (
          <div key={index} className="song-item" onClick={() => onSongSelect(song)}>
          <div className="song-info">
            <span className="song-title">{song.title}</span>
            <span className="song-artist"> by {song.artist}</span>
          </div>
          <button 
            className="play-button"
            onClick={() => handlePlayClick(song)}
          >
            {currentPlaying === song.title ? "⏸️" : "▶️"}
          </button>
        </div>
        ))}
      </div>
    </div>
  );
}

export default SongSelectionModal
