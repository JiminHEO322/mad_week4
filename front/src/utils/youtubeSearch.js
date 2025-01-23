import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';


export async function searchYouTubeVideo(title, artist) {
  try {
    const query = `${title} lyrics`;
    console.log(`🔍 YouTube 검색어 확인: ${query}`);
    const response = await axios.get(BASE_URL, {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: query,
        key: API_KEY,
        type: 'video',
      },
    });

    // 응답 검증
    console.log("📌 YouTube API 응답 데이터:", response.data);
    if (!response.data || !response.data.items || response.data.items.length === 0) {
      console.error("⚠️ YouTube API 응답에 검색 결과가 없습니다.");
      return null;
    }

    if (response.data.items.length > 0) {
      return response.data.items[0].id.videoId; // 첫 번째 검색 결과의 videoId 반환
    } else {
      console.error('No videos found');
      return null;
    }
  } catch (error) {
    console.error('YouTube API Error:', error);
    return null;
  }
}
