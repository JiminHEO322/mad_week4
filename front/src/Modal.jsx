// Modal.js
import React, { useState } from 'react'
import './Modal.css'

const Modal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null
  const [text, setText] = useState('')

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>일기 작성</h2>
        <textarea
          placeholder="오늘의 일기를 작성하세요..."
          rows="10"
          style={{ width: '80%', padding: '10px', resize: 'none' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={() => onSave(text)} className="save-btn">
            Generate LP
          </button>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    </div>
  )
}

export default Modal
