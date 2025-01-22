// Modal.js
import React, { useState } from 'react'
import './SongSelectionModal.css'

const SongSelectionModal = ({ isOpen, onClose, recommendedSongs, onSongSelect }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>추천 노래를 선택하세요</h2>
        {recommendedSongs.map((song, index) => (
          <div 
            key={index} 
            onClick={() => onSongSelect(song)}
            style={{ cursor: 'pointer', marginBottom: '8px' }}
          >
            {song.title} - {song.artist}
          </div>
        ))}
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

export default SongSelectionModal
