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
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTestingSong, setIsTestingSong] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLpSelection, setShowLpSelection] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSongSelectionModal, setShowSongSelectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [loginMessage, setLoginMessage] = useState("");
  const [loadingStage, setLoadingStage] = useState(0); // 진행 단계
  const loadingSteps = [
      "글을 분석 중입니다.",
      "글에서 감정과 키워드를 추출하고 있습니다.",
      "LP 표지를 생성하고 있습니다.",
      "알맞는 노래를 검색 중입니다.",
  ];

const specialChars = ["♤", "♧", "†", "£", "¢"];
const [specialCharIndex, setSpecialCharIndex] = useState(0);
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('userId');
    return savedUserId || null;
  });
  const [youTubePlayer, setYouTubePlayer] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const defaultSong = {
    title: "Reality",
    artist: "Richard Sanderson",
    videoId: "T5dnEKqOaHw",
  };
  const [youTubeVideoId, setYouTubeVideoId] = useState(defaultSong.videoId);

  const [selectedLP, setSelectedLP] = useState(() => {
    const savedLP = localStorage.getItem('selectedLP');
    return savedLP ? JSON.parse(savedLP) : null;
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log("🔍 useEffect - storedUserId:", storedUserId);
  
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setSelectedLP({ song: defaultSong }); // 로그아웃 시 기본 음악 설정
    }
  }, []);
  
  useEffect(() => {
    if (isLoggedIn) {
      const savedLP = localStorage.getItem('selectedLP');
      if (savedLP) {
        console.log("📌 LocalStorage에서 불러온 LP:", JSON.parse(savedLP));
        setSelectedLP(JSON.parse(savedLP));
      }
    }
  }, [isLoggedIn]); // isLoggedIn이 true일 때만 실행
  

  useEffect(() => {
    if (isLoggedIn) {
      if (selectedLP?.song?.videoId) {
        console.log("🔄 로그인 상태: 사용자 선택 음악 재생", selectedLP.song.videoId);
        setYouTubeVideoId(selectedLP.song.videoId);
      }
    } else {
      console.log("🔄 로그아웃 상태: 기본 음악 재생", defaultSong.videoId);
      setYouTubeVideoId(defaultSong.videoId);
    }
  }, [isLoggedIn, selectedLP]);
  

  useEffect(() => {
    if (isLoading) {
        const interval = setInterval(() => {
            setSpecialCharIndex((prev) => (prev + 1) % specialChars.length);
        }, 500); // 0.5초마다 변경
        return () => clearInterval(interval);
    }
  }, [isLoading]);


  const handleSaveDiary = async (diaryText) => {
    if (!diaryText.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setSpecialCharIndex(0);
    setLoadingStage(0);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
      setLoadingStage(1);

      const response = await axios.post('http://localhost:8000/lps/generate', {
        user_id: userId,
        text: diaryText,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Generated LP:", response);
      setLoadingStage(2);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1초 대기

      setSelectedLP(response.data.diary);
      localStorage.setItem('selectedLP', JSON.stringify(response.data));
      console.log("SET Selected LP:", selectedLP);
      setRecommendedSongs(response.data.song);
      setLoadingStage(3);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1초 대기

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
      handlePlayVideo(null);
      setShowSongSelectionModal(false);
  
      alert("노래가 LP에 등록되었습니다!");
      window.location.reload();

    } catch (error) {
      console.error("노래 선택 에러:", error);
      alert("노래 선택에 실패했습니다.");
    }
  };

  const handleStartClick = () => {
    console.log("Current Animation State:", isAnimating);
    console.log("-- 재생할 비디오 아이디는: ", youTubeVideoId);
    if (isAnimating) {
      // 애니메이션을 멈춤 → 비디오를 pause
      console.log("Pausing video & stopping animation...");
      if (youTubePlayer) {
        youTubePlayer.pauseVideo();
      }
    } else {
      // 애니메이션을 시작 → 비디오를 play
      console.log("Playing video & starting animation...");
      if (youTubePlayer && !isTestingSong) {
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
    setYouTubePlayer(player);
    player.setVolume(40);
    if (isAnimating) {
      console.log('노래 재생 가능');
      player.playVideo();  // LP가 회전 중일 때만 음악 재생
    } else {
      console.log('노래 재생 불가능');
      player.pauseVideo();  // LP가 멈춰있으면 자동 재생 방지
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
          
          localStorage.setItem('userId', data.user_id);
          console.log("User ID:", data.user_id);
          setUserId(data.user_id);
          setIsLoggedIn(true);
        })
        .catch((err) => console.error("Error saving user:", err));
      
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  const handleRecordClick = () => {
    if(!isLoggedIn){
      setLoginMessage("고양이를 눌러서 로그인을 해주세요!");
      setTimeout(() => setLoginMessage(""), 5000);
      return;
    }else{
      navigate('/lp-records', { state: { userId: userId } }); 
    }
  };

  const handleTableClick = () => {
    if(!isLoggedIn){
      setLoginMessage("고양이를 눌러서 로그인을 해주세요!");
      console.log("로그인해랴", loginMessage)
      setTimeout(() => setLoginMessage(""), 5000);
      return;
    }else{
      setShowModal(true)
    }
  };

  const handleCatClick = () => {
    if (isLoggedIn) {
      console.log("🔴 로그아웃 진행...");
      
      // ✅ 상태 변경 순서 명확하게 설정
      localStorage.removeItem("userId");
      localStorage.removeItem("selectedLP");
  
      setUserId(null);
      setIsLoggedIn(false);
  
      console.log("✅ 로그아웃 완료. 기본 LP와 노래로 변경됨.");
      window.location.reload();
    } else {
      handleGoogleLogin();
    }
  };
  

  const handlePlayVideo = (videoId) => {
    console.log(`handlePlayVideo 호출됨, videoId: ${videoId}`);

    if (youTubePlayer) {
      if (videoId === null) {
        console.log("비디오 정지 요청됨");
        youTubePlayer.pauseVideo();
        setIsTestingSong(false);
      } else {
        console.log(`비디오 로드 및 재생: ${videoId}`);
        setYouTubeVideoId(videoId);
        youTubePlayer.loadVideoById(videoId);
        youTubePlayer.playVideo();
        setIsTestingSong(true);
      }
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

          {loginMessage && (
              <div className="login-message">
                  {loginMessage}
              </div>
          )}


          {isLoading && (
              <div className="loading-overlay">
                  <div className="loading-content">
                      <p className="M1">"오늘의 LP를 만들고 있습니다! 잠시만 기다려 주세요:D"</p>
                      <p className="M2">{specialChars.slice(0, specialCharIndex + 1).join(" ")}</p>
                      <p className="M3">{loadingSteps[loadingStage]}</p>
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
            onPlay={handlePlayVideo}
          />

          
            <div>
              <YouTubePlayer 
                videoId={youTubeVideoId} 
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