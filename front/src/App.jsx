import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Canvas } from '@react-three/fiber';
import MyElement3D from './MyElement3D';
import { useState, useRef, useEffect } from 'react';
import LpSelection from './LpSelection';
import Modal from './Modal';
import LPRecordsPage from './LPRecordsPage';

const CLIENT_ID = "325452960914-43dnfemshc5ukosjkj999ou9ldbcu328.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLpSelection, setShowLpSelection] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState('user123');
  const [currentMusic, setCurrentMusic] = useState('./musics/backgroundmusic.mp3');
  const audioRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLP, setSelectedLP] = useState(() => {
    // 컴포넌트가 마운트될 때 로컬 스토리지에서 LP 불러오기
    const savedLP = localStorage.getItem('selectedLP');
    return savedLP ? JSON.parse(savedLP) : location.state?.selectedLP || null;
  });
  console.log('(APP) Selected LP:', selectedLP);

  // 오디오 객체 생성 및 기본 설정
  useEffect(() => {
    audioRef.current = new Audio(currentMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    audioRef.current.play();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause(); // 컴포넌트 언마운트 시 음악 정지
      }
    };
  }, [currentMusic]);

  useEffect(() => {
    if (audioRef.current) {
      if (isAnimating && hasInteracted) {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
      } else {
        audioRef.current.pause(); // 음악 정지
      }
    }
  }, [isAnimating, hasInteracted]);

  const handleLpSelect = (musicPath) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = musicPath;
      audioRef.current.load();
      audioRef.current.play();
    }
    setCurrentMusic(musicPath);
    setShowLpSelection(false);
  };

  const handleInteraction = () => {
    setHasInteracted(true);
    setIsAnimating(!isAnimating);

    if (audioRef.current && !isAnimating) {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  };

  const handleSaveDiary = async (diaryText) => {
    if (!diaryText.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/lps/generate', {
        user_id: userId,
        text: diaryText,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Generated LP:", response);

      setSelectedLP(response.data);
      localStorage.setItem('selectedLP', JSON.stringify(response.data));
      
      alert("LP 커버가 성공적으로 생성되었습니다!");
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("LP 커버 생성에 실패했습니다.");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (response) => {
      console.log("Login Success:", response);

      if (!response.access_token) {
        console.error("access_token is missing");
        return;
      }

      await fetch("http://localhost:8000/users/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: response.access_token }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Server Response:", data);
          setIsLoggedIn(true);
        })
        .catch((err) => console.error("Error saving user:", err));
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  const handleRecordClick = () => {
    navigate('/lp-records'); // LP판 클릭 시 /lp-records로 이동
  };

  const handleCatClick = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false); // 로그아웃 처리
      console.log("로그아웃 되었습니다.");
    } else {
      handleGoogleLogin(); // 로그인 처리
      console.log("로그인 되었습니다.");
    }
  };

  return (
    <>
      {showLpSelection ? (
        <LpSelection onLpSelect={handleLpSelect} />
      ) : (
        <>
          <Canvas camera={{ near: 0.1, far: 100, position: [-50, 15, 0] }}>
            <MyElement3D isAnimating={isAnimating} onRecordClick={handleRecordClick} onCatClick={handleCatClick} isLoggedIn={isLoggedIn}/>
          </Canvas>
          <div className="control-button" onClick={handleInteraction}>
            {isAnimating ? 'Stop Music' : 'Start Music'}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }} className="diary-button" onClick={() => setShowModal(true)}>
            Write Diary
          </div>

          <Modal isOpen={showModal} onClose={() => setShowModal(false)} onSave={(diaryText) => handleSaveDiary(diaryText)} />

          <button className="fetch-lp-button" onClick={() => navigate('/lp-records')}>
            내 LP 보기
          </button>

          {selectedLP ? (
            <img className="selected-lp" src={`data:image/png;base64,${selectedLP.image}`} alt="Selected LP Cover" />
          ) : (
            <p style={{ color: 'white' }}>LP를 선택해주세요</p>
          )}
        </>
      )}
    </>
  );
}

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

export default AppWrapper;
