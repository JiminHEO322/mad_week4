
import './App.css'
import {Canvas} from '@react-three/fiber'
import MyElement3D from './MyElement3D'
import { useState, useRef, useEffect } from 'react'
import LpSelection from './LpSelection'

function App() {
  const [isAnimating, setIsAnimating] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showLpSelection, setShowLpSelection] = useState(false)
  const [currentMusic, setCurrentMusic] = useState('./musics/backgroundmusic.mp3')
  const audioRef = useRef(null)

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
        </>
      )}
    </>
  )
} 

export default App
