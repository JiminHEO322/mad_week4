import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Canvas } from '@react-three/fiber';
import MyElement3D from './MyElement3D';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import LPRecordsPage from './LPRecordsPage';
import SongSelectionModal from './SongSelectionModal';
import { searchYouTubeVideo } from './utils/youtubeSearch';
import YouTubePlayer from './YouTubePlayer';

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
  const [showLpSelection, setShowLpSelection] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSongSelectionModal, setShowSongSelectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('userId');
    return savedUserId || null;
  });
  const [youTubePlayer, setYouTubePlayer] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const defaultSong = {
    title: "Number One Girl",
    artist: "Rosé",
    videoId: "9XM1KnHvtGg",
  };
  const [youTubeVideoId, setYouTubeVideoId] = useState(defaultSong.videoId);

  const [selectedLP, setSelectedLP] = useState(() => {
    const savedLP = localStorage.getItem('selectedLP');
    return savedLP ? JSON.parse(savedLP) : { song: defaultSong };
  });
  console.log('(APP) Selected LP:', selectedLP);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    setYouTubeVideoId(selectedLP?.song?.videoId || defaultSong.videoId);
    console.log("USEEFFECT VIDEO ID: ", youTubeVideoId)
  }, [selectedLP]);


  const handleSaveDiary = async (diaryText) => {
    if (!isLoggedIn) {
      alert("고양이를 눌러서 로그인해주세요!");
      return;
    }

    if (!diaryText.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);


    console.log('Request Payload:', {
      user_id: userId,
      text: diaryText
    });


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

      setSelectedLP(response.data.diary);
      localStorage.setItem('selectedLP', JSON.stringify(response.data));
      console.log("SET Selected LP:", selectedLP);
      setRecommendedSongs(response.data.song);

      alert("LP 커버가 성공적으로 생성되었습니다!");
      setShowModal(false);

      setShowSongSelectionModal(true);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("LP 커버 생성에 실패했습니다.");
    }finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  const handleSongSelect = async (song) => {
    try {
      if (!selectedLP?._id) {
        alert("LP 정보가 없습니다.");
        return;
      }

      console.log("Selected Song:", song.title, song.artist);
      console.log("Selected LP INFO:", selectedLP);

      const videoId = await searchYouTubeVideo(song.title, song.artist);
      if (!videoId) {
        alert('YouTube에서 해당 노래를 찾을 수 없습니다.');
        return;
      }
      console.log("VIDEO ID: ", videoId)
      setYouTubeVideoId(videoId);


      const updatedLP = { 
        ...selectedLP,
        song: {
          ...selectedLP.song,
          title: song.title,
          artist: song.artist,
          videoId: videoId
        }
      };

      setSelectedLP(updatedLP);
      localStorage.setItem('selectedLP', JSON.stringify(updatedLP));
      console.log("Updated LP:", updatedLP);

      const response = await axios.post('http://localhost:8000/lps/select-song', {
        user_id: updatedLP.user_id,
        diary_id: updatedLP._id.toString(),
        song:updatedLP.song
      }, {
          headers: {
            'Content-Type': 'application/json',
          },
      });
      console.log("노래 추가됨: ", response)
  
      // 노래 선택 모달 닫기
      setShowSongSelectionModal(false);
  
      alert("노래가 LP에 등록되었습니다!");
    } catch (error) {
      console.error("노래 선택 에러:", error);
      alert("노래 선택에 실패했습니다.");
    }
  };

  const handleStartClick = () => {
    // 현재 상태 확인 (true = 애니메이션 실행 중, false = 정지 중)
    console.log("Current Animation State:", isAnimating);
    console.log("Current Player State:", youTubePlayer);
    if (isAnimating) {
      // 애니메이션을 멈춤 → 비디오를 pause
      console.log("Pausing video & stopping animation...");
      if (youTubePlayer) {
        youTubePlayer.pauseVideo();
      }
    } else {
      // 애니메이션을 시작 → 비디오를 play
      console.log("Playing video & starting animation...");
      if (youTubePlayer) {
        youTubePlayer.playVideo();
      }
    }

    // 마지막에 상태를 토글해준다
    setIsAnimating(!isAnimating);
  };
  

  const handlef1Click = () => {
    if (youTubePlayer) youTubePlayer.setVolume(10);  // 0~100
  };
  const handlef2Click = () => {
    if (youTubePlayer) youTubePlayer.setVolume(40);
  };
  const handlef3Click = () => {
    if (youTubePlayer) youTubePlayer.setVolume(70);
  };
  const handlef4Click = () => {
    if (youTubePlayer) youTubePlayer.setVolume(100);
  };
  
  const handlePlayerReady = (player) => {
    console.log("handlePlayerReady called:", player);
    if (player) {
      setYouTubePlayer(player);
      player.setVolume(40);  // 초기 볼륨 설정
      player.playVideo(); 
    } else {
      console.error("Player is null!");
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
          
          localStorage.setItem('userId', data.user_id);
          console.log("User ID:", data.user_id);
          setUserId(data.user_id);
        })
        .catch((err) => console.error("Error saving user:", err));
      
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  const handleRecordClick = () => {
    if(!isLoggedIn){
      alert("고양이를 눌러서 로그인을 해주세요!");
      return;
    }else{
      navigate('/lp-records', { state: { userId: userId } }); 
    }
  };

  const handleTableClick = () => {
    if(!isLoggedIn){
      alert("고양이를 눌러서 로그인을 해주세요!");
      return;
    }else{
      setShowModal(true)
    }
  };

  const handleCatClick = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false); // 로그아웃 처리
    } else {
      handleGoogleLogin(); // 로그인 처리
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
            <MyElement3D 
              isAnimating={isAnimating} 
              onRecordClick={handleRecordClick} 
              onCatClick={handleCatClick} 
              onTableClick={handleTableClick} 
              onStartClick={handleStartClick} 
              onf1Click={handlef1Click} 
              onf2Click={handlef2Click} 
              onf3Click={handlef3Click} 
              onf4Click={handlef4Click} 
              isLoggedIn={isLoggedIn} 
              selectedLP={selectedLP} 
              setHoveredText={setHoveredText}/>
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

          <SongSelectionModal
            isOpen={showSongSelectionModal}
            recommendedSongs={recommendedSongs}
            onClose={() => setShowSongSelectionModal(false)}
            onSongSelect={handleSongSelect}
          />

          
            <div>
              <YouTubePlayer 
                videoId={youTubeVideoId || defaultSong.videoId} 
                onPlayerReady={handlePlayerReady}/>
            </div>
          
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