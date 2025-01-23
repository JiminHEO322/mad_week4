import requests
from dotenv import load_dotenv
import os

load_dotenv()
LASTFM_API_KEY = os.getenv('LASTFM_API_KEY')
LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/'

def recommend_song(mood: str, keyword: str, limit: int = 3):
    """
    Last.fm API를 사용하여 노래를 추천합니다.
    mood: 감정 (str, 단일 값)
    keyword: 키워드 (str, 단일 값)
    limit: 반환할 곡의 수 (기본값 3)
    """
    recommend_list = []

    # 태그 생성
    tag = f"{keyword}"  # 감정과 키워드를 쉼표로 연결
    print(f"노래 추천 태그: {tag}")

    params = {
        'method': 'tag.gettoptracks',
        'tag': tag,
        'api_key': LASTFM_API_KEY,
        'format': 'json',
        'limit': limit
    }

    response = requests.get(LASTFM_API_URL, params=params)

    if response.status_code == 200:
        data = response.json()
        if 'tracks' in data and 'track' in data['tracks']:
            for track in data['tracks']['track']:
                recommend_list.append({
                    'title': track['name'],
                    'artist': track['artist']['name']
                })
    else:
        print(f"API 호출 실패: {response.status_code}, {response.text}")

    if not recommend_list:
        print("추천 결과가 없습니다.")
        return [{"title": "No recommendations available", "artist": "Unknown"}]
    
    return recommend_list
