import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

// /**
//  * 노래 제목과 가수로 YouTube 검색
//  * @param {string} title 노래 제목
//  * @param {string} artist 가수 이름
//  * @returns {Promise<string|null>} 검색된 YouTube 동영상의 videoId
//  */
export async function searchYouTubeVideo(title, artist) {
  try {
    const query = `${title} ${artist} official music video`;
    const response = await axios.get(BASE_URL, {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: query,
        key: API_KEY,
        type: 'video',
      },
    });

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
