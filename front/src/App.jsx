
import './App.css'
import {Canvas} from '@react-three/fiber'
import MyElement3D from './MyElement3D'
import { useState, useRef, useEffect } from 'react'

function App() {
  const [isAnimating, setIsAnimating] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    // 오디오 객체 생성 및 기본 설정
    audioRef.current = new Audio('./musics/backgroundmusic.mp3')
    audioRef.current.loop = true // 음악 반복
    audioRef.current.volume = 1 // 볼륨 설정
    audioRef.current.play() // 초기 재생
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      if (isAnimating) {
        audioRef.current.play() // 음악 재생
      } else {
        audioRef.current.pause() // 음악 정지
      }
    }
  }, [isAnimating])

  return (
    <>
      <Canvas 
      camera={{
        near: 0.1,
        far: 100,
        position: [-50, 15, 0]
      }}>
        <MyElement3D isAnimating={isAnimating} />
      </Canvas>
      {/* 재생/정지 버튼 */}
      <div
                className="control-button"
                onClick={() => setIsAnimating(!isAnimating)} // 상태 토글
            >
                {isAnimating ? "Stop Music" : "Start Music"}
            </div>
    </>
  )
} 

export default App
