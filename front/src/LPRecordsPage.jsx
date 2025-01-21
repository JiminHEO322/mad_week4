import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LPRecordsPage.css';

const LPRecordsPage = () => {
  const [lpRecords, setLpRecords] = useState([]);
  const userId = 'user123'; // 필요 시 로그인 후 상태에서 받아오기
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLPs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/lps/', {
          params: { user_id: userId },
        });

        if (response.data.length === 0) {
          alert('LP 기록이 없습니다.');
        } else {
          setLpRecords(response.data);
        }
      } catch (error) {
        console.error('Error fetching LP records:', error);
        alert('LP 기록을 불러오는 데 실패했습니다.');
      }
    };

    fetchUserLPs();
  }, [userId]);


  // LP 클릭 시 메인 페이지로 데이터 전달
  const handleSelectLP = (record) => {
    console.log('(LPRECORDS) Selected LP:', record);
    navigate(`/`, { state: { selectedLP: record } });
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* <button onClick={() => window.history.back()} className="back-button">
        돌아가기
      </button> */}
      <h1 style={{color: 'white'}}>{userId}의 LP 기록</h1>
      <div className="lp-list">
        {lpRecords.length > 0 ? (
          lpRecords.map((record, index) => (
            <div key={index} className="lp-item" onClick={() => handleSelectLP(record)}>
              <img src={`data:image/png;base64,${record.image}`} alt="LP Cover" style={{ maxWidth: '300px', borderRadius: '10px' }} />
              <p><strong>{record.text}</strong> </p>
              <p>{new Date(record.created_at).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>LP 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default LPRecordsPage;
