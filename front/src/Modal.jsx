// Modal.js
import React, { useState } from 'react'
import './Modal.css'

const Modal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null
  const [text, setText] = useState('')

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>♤ 오늘의 LP 만들기 £</h2>
        <textarea
          placeholder="레코드판에 담아 기록할 오늘 하루를 적어주세요:)"
          rows="10"
          style={{ width: '80%', padding: '10px', resize: 'none' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="modal-actions">
        <button onClick={onClose} className="close-btn">취소 †</button>
          <button onClick={() => onSave(text)} className="save-btn">
            LP 생성하기 ¢
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
