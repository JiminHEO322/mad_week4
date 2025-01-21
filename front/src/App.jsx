import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './App.css'
import {Canvas} from '@react-three/fiber'
import MyElement3D from './MyElement3D'
import { useState, useRef, useEffect } from 'react'
import LpSelection from './LpSelection'
import Modal from './Modal'
import LPRecordsPage from './LPRecordsPage'

function App() {
  const [isAnimating, setIsAnimating] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showLpSelection, setShowLpSelection] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [userId, setUserId] = useState('user123'); // 특정 사용자 ID
  const [currentMusic, setCurrentMusic] = useState('./musics/backgroundmusic.mp3');
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedLP = location.state?.selectedLP || null;
  console.log('(APP) Selected LP:', selectedLP);

  useEffect(() => {
    // 오디오 객체 생성 및 기본 설정
    audioRef.current = new Audio(currentMusic)
    audioRef.current.loop = true // 음악 반복
    audioRef.current.volume = 0.4 // 볼륨 설정
    audioRef.current.play() // 초기 재생
    return () => {
      if (audioRef.current) {
        audioRef.current.pause() // 컴포넌트 언마운트 시 음악 정지
      }
    };
  }, [currentMusic])

  const handleLpSelect = (musicPath) => {
    if (audioRef.current) {
      audioRef.current.pause() // 기존 음악 정지
      audioRef.current.src = musicPath // 새로운 음악 경로 설정
      audioRef.current.load() // 음악 로드
      audioRef.current.play() // 새로운 음악 재생
    }
    setCurrentMusic(musicPath)
    setShowLpSelection(false) // LP 선택 화면 닫기
  }

  useEffect(() => {
    if (audioRef.current ) {
      if (isAnimating && hasInteracted) {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error)
      })
      } else {
        audioRef.current.pause() // 음악 정지
      }
    }
  }, [isAnimating, hasInteracted])

  const handleInteraction = () => {
    setHasInteracted(true) // 사용자 상호작용으로 설정
    setIsAnimating(!isAnimating)

    if (audioRef.current && !isAnimating) {
      audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error)
      })
    }
  }

  const handleSaveDiary = async (diaryText) => {
    // alert('일기가 저장되었습니다.')
    // setShowModal(false)

    if (!diaryText.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/lps/generate', 
        {
          user_id: userId,
          text: diaryText
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      setGeneratedImage(`data:image/png;base64,${response.data.image}`);
      alert("LP 커버가 성공적으로 생성되었습니다!");
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("LP 커버 생성에 실패했습니다.");
    } 
  }

  return (
    <>
      {showLpSelection ? (
        <LpSelection onLpSelect={handleLpSelect} />
      ) : (
        <>
          <Canvas
            camera={{
              near: 0.1,
              far: 100,
              position: [-50, 15, 0],
            }}
          >
            <MyElement3D
              isAnimating={isAnimating}
              onRecordClick={() => setShowLpSelection(true)} // 레코드판 클릭 시 LP 선택 화면으로 전환
            />
          </Canvas>
          {/* 재생/정지 버튼 */}
          <div
            className="control-button"
            onClick={handleInteraction} // 상태 토글
          >
            {isAnimating ? 'Stop Music' : 'Start Music'}
          </div>

          {/* 일기 쓰기 모달 열기 버튼 */}
          <div 
            style={{ marginTop: '20px', textAlign: 'center' }}
            className="diary-button"
            onClick={() => setShowModal(true)}
          >
              Write Diary
          </div>

          {/* 일기 모달 창 */}
          <Modal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            onSave={(diaryText) => handleSaveDiary(diaryText)} 
          />

          {/* LP 불러오기 버튼 */}
          <button className="fetch-lp-button" onClick={() => navigate('/lp-records')}>
            내 LP 보기
          </button>

          {selectedLP ? (
              <img
                className="selected-lp"
                src={`data:image/png;base64,${selectedLP.image}`}
                alt="Selected LP Cover"
              />
          ) : (
            <p style={{ color: 'white' }}>LP를 선택해주세요</p>
          )}
        </>
      )}
    </>
  )
} 

// 라우터 설정 추가
function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/lp-records" element={<LPRecordsPage />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper
