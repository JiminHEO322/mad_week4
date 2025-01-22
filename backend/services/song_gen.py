import requests
from dotenv import load_dotenv
import os

load_dotenv()
LASTFM_API_KEY = os.getenv('LASTFM_API_KEY')
LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/'

def recommend_song(mood: str, keyword: str = None, limit: int = 3):
    recommend_list = []
    
    # 태그 구성: 감정 + 키워드 조합
    if keyword:
        search_tag = f"{mood},{keyword}"  # 예: "happy,rain"
    else:
        search_tag = mood
        
    params = {
        'method': 'tag.gettoptracks',
        'tag': search_tag,
        'api_key': LASTFM_API_KEY,
        'format': 'json',
        'limit': limit
    }

    response = requests.get(LASTFM_API_URL, params=params)

    if response.status_code == 200:
        data = response.json()
        for track in data['tracks']['track']:
            recommend_list.append({
                'title': track['name'],
                'artist': track['artist']['name']
            })
        return recommend_list
    else:
        print("오류 발생:", response.status_code)