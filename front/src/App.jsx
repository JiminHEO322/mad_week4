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

const CLIENT_ID = import.meta.env.VITE_YW_GOOGLE_CLIENT_ID;
console.log('Client ID:', CLIENT_ID);

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const [hoveredText, setHoveredText] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLpSelection, setShowLpSelection] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
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

    setIsLoading(true);

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
    }finally {
      setIsLoading(false); // 로딩 상태 종료
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
    navigate('/lp-records'); 
  };

  const handleTableClick = () => {
    setShowModal(true)
  };
  const handlef1Click = () => {
    audioRef.current.volume = 0.1;
  };
  const handlef2Click = () => {
    audioRef.current.volume = 0.4;
  };
  const handlef3Click = () => {
    audioRef.current.volume = 0.7;
  };
  const handlef4Click = () => {
    audioRef.current.volume = 1;
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
          {hoveredText && (
                <div className="hovered-text"> {hoveredText} </div>
            )}
          <Canvas camera={{ near: 0.1, far: 100, position: [-50, 15, 0] }}>
            <MyElement3D isAnimating={isAnimating} onRecordClick={handleRecordClick} onCatClick={handleCatClick} onTableClick={handleTableClick} 
              onStartClick={handleInteraction} onf1Click={handlef1Click} onf2Click={handlef2Click} onf3Click={handlef3Click} onf4Click={handlef4Click} 
              isLoggedIn={isLoggedIn} selectedLP={selectedLP} setHoveredText={setHoveredText}/>
          </Canvas>

          {isLoading && ( 
            <div className="loading-overlay">
              <div className="loading-content">
                <p>“LP를 생성 중입니다! 잠시만 기다려주세요” ♤ ♧ † £ ¢</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSave={(diaryText) => handleSaveDiary(diaryText)}
            />
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
