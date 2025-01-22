import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import './LPRecordsPage.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import { OrbitControls } from '@react-three/drei';


const CubeBackground = () => {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      './images/cubemap/cube_left.png',
      './images/cubemap/cube_right.png',
      './images/cubemap/cube_up1.png',
      './images/cubemap/cube_down1.png',
      './images/cubemap/cube_front.png',
      './images/cubemap/cube_back.png',
    ]);
    scene.background = texture;

    return () => {
      scene.background = null; // 클린업
    };
  }, [scene]);

  return null;
};


const LPRecordsPage = () => {
  const [lpRecords, setLpRecords] = useState([]);
  const [originalRecords, setOriginalRecords] = useState([]);
  const [selectedLP, setSelectedLP] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const userId = 'user123'; // 필요 시 로그인 후 상태에서 받아오기
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLPs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/lps/', {
          params: { user_id: userId },
        });

        if (response.data.length === 0) {
          alert('LP 기록이 없습니다.');
        } else {
          setLpRecords(response.data);
          setOriginalRecords(response.data);
        }
      } catch (error) {
        console.error('Error fetching LP records:', error);
        alert('LP 기록을 불러오는 데 실패했습니다.');
      }
    };

    fetchLPs();
  }, [userId]);

  // 날짜 선택 핸들러
  const handleDateChange = async (date) => {
    setSelectedDate(date);

    // 날짜 형식 변환 (YYYY-MM-DD)
    const formattedDate = date.toLocaleDateString("en-CA");
    console.log("Selected Date:", formattedDate);

    try {
      // 서버에서 특정 날짜에 해당하는 LP만 가져오기
      const response = await axios.get('http://localhost:8000/lps/', {
        params: { user_id: userId, date: formattedDate },
      });
      console.log("Server Response:", response.data);
      if (response.data.length === 0) {
        console.log(`No LP records found for ${formattedDate}`); // 디버깅: 해당 날짜 데이터 없음
        setLpRecords([]);
      }
      setLpRecords(response.data); // 필터링된 LP 목록 저장
    } catch (error) {
      console.error('Error fetching LP records for selected date:', error);
      alert('선택한 날짜의 LP 기록을 불러오는 데 실패했습니다.');
    }
  };

  // All 클릭 핸들러
  const handleShowAll = () => {
    console.log('전체 보기 클릭');
    setSelectedDate(new Date());
    setLpRecords(originalRecords);
  };

  // Date 클릭 핸들러
  const handleSortByDate = () => {
    console.log('날짜별 클릭');
    setSelectedDate(new Date());
    const sortedRecords = [...originalRecords].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    setLpRecords(sortedRecords);
  };

  // Star 클릭 핸들러 (즐겨찾기 기능 구현 전)
  const handleShowFavorites = () => {
    console.log('즐겨찾기 클릭');
    alert('즐겨찾기 기능은 아직 구현되지 않았습니다!');
  };

  // LP 클릭 핸들러
  const handleLPClick = (lp) => {
    setSelectedLP(lp);
    setIsDetailView(true);
  };

  // 상세보기 화면 바깥 클릭 핸들러
  const handleBackdropClick = () => {
    setSelectedLP(null);
    setIsDetailView(false);
  };

  // LP 클릭 시 메인 페이지로 데이터 전달
  const handleSelectLP = (record) => {
    console.log('(LPRECORDS) Selected LP:', record);
    localStorage.setItem('selectedLP', JSON.stringify(record));  // 저장
    navigate(`/`, { state: { selectedLP: record } });
  };


  return (
    <div className="lp-page">
      {!isDetailView ? (
        <div className="lp-grid">
          <header className="lp-header">♧ 나의 LP 다이어리 ♧</header>
          <div className='lp-box'>
            {lpRecords.length > 0 ? (
              lpRecords.map((lp, index) => (
                <div
                  key={index}
                  className="lp-cover"
                  onClick={() => handleLPClick(lp)}
                >
                  <img src={`data:image/png;base64,${lp.image}`} alt="LP Cover" />
                </div>
              ))
            ) : (
              <div className="no-lp-message">
                {`${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일에 만들어진 LP가 없습니다.`}
              </div>
            )}
          </div>
          <div className="custom-calendar-container">
            <Calendar
              value={selectedDate}
              tileClassName={({ date, view }) =>
                view === 'month' && date.getDay() === 0 ? 'sunday' : '' // 일요일 강조 예시
              }
              onChange={handleDateChange}
            />
            <div className="sort-icons">
            <img
              src="./images/All.png"
              alt="Show All"
              onClick={handleShowAll}
            />
            <img
              src="./images/Date.png"
              alt="Sort by Date"
              onClick={handleSortByDate}
            />
            <img
              src="./images/Star.png"
              alt="Show Favorites"
              onClick={handleShowFavorites}
            />
          </div>
          </div>
          <img
            className="home-cat-icon"
            src='./images/HomeCat.png' /* 이미지 경로 */
            alt="Home Icon"
            onClick={() => navigate("/")} /* 클릭 시 홈으로 이동 */
          />
        </div>
        
      ) : (
        <div className="lp-detail" onClick={handleBackdropClick}>
          <Canvas>
            <OrbitControls />
            <CubeBackground /> {/* Cube Texture 배경 */}
          </Canvas>
          <div className="lp-detail-container" onClick={(e) => e.stopPropagation()}>
            <div className="lp-cover-layout">
              <div className="lp-cover-detail">
                <img src={`data:image/png;base64,${selectedLP.image}`} alt="LP Cover" />
                <div className="lp-disk"></div>
              </div>
            </div>
            <div className="lp-info">
              <p>{new Date(selectedLP.created_at).toLocaleDateString()}</p>
              <h2>{selectedLP.text}</h2>
              <button className="play-button" onClick={handleSelectLP(selectedLP)}>재생하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LPRecordsPage;
