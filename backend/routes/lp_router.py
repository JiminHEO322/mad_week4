import base64
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from database import diary_collection
from models import LP, Song
from diary_schema import DiaryRequest
from typing import Optional

from services.image_gen import generate_image
from services.song_gen import recommend_song
from services.prompt_gen import english_translation, mood_extraction, keyword_extraction

from bson import ObjectId

router = APIRouter() 


@router.get("/")
def get_diaries(user_id: str, date: Optional[str] = None):
    '''유저의 모든 LP 조회'''
    query = {"user_id": user_id}
    
    # 날짜가 제공되었을 경우 필터링
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
            next_day = target_date + timedelta(days=1)  # 다음 날 계산
            query["created_at"] = {
                "$gte": target_date,
                "$lt": next_day
            }
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    diaries = list(diary_collection.find(query, {"_id": 0}))
    if not diaries:
        return []
    return diaries


@router.get("/diary")
def get_diary(user_id: str, diary_id: str):
    '''특정 LP 조회'''
    diary = diary_collection.find_one({"_id": ObjectId(diary_id), "user_id": user_id})
    if not diary:
        raise HTTPException(status_code=404, detail="LP not found")
    diary["_id"] = str(diary["_id"])
    return diary


@router.post("/generate")
def generate_diary(request: DiaryRequest):
    '''LP 커버 생성 및 노래 추천'''
    translated_text = english_translation(request.text)
    print(f"Translated text: {translated_text}")
    mood = mood_extraction(translated_text)
    print(f"Detected mood: {mood}")
    keyword = keyword_extraction(translated_text)
    print(f"Detected keyword: {keyword}")

    if mood == "unknown":
        prompt = f"vinyl record cover featuring {keyword}"
    else:
        prompt = f"vinyl record cover in a {mood} style, featuring {keyword}"
    
    # Hugging Face 이미지 생성
    image = generate_image(prompt)
    if image:
        # 이미지 저장 경로 설정
        save_dir = "images"
        os.makedirs(save_dir, exist_ok=True)  # 디렉토리 없으면 생성
        file_path = os.path.join(save_dir, f"{keyword}_{mood}.png")
        
        # Base64로 변환
        base64_image = base64.b64encode(image).decode("utf-8")

        # 이미지 파일로 저장
        with open(file_path, "wb") as f:
            f.write(image)
        
        print(f"Image saved at: {file_path}")
    else:
        print("Image generation failed.")
    
    if mood == "unknown":
        recommended_songs = recommend_song(keyword)
    else:
        recommended_songs = recommend_song(mood)
        
    print(f"Recommended songs: {recommended_songs}")

    if not recommended_songs:
        song_list = [Song(title="No Title", artist="Unknown")]
    else:
        song_list = [Song(title=title, artist=artist) for title, artist in recommended_songs.items()]

    # MongoDB에 저장할 데이터
    diary = LP(
        user_id=request.user_id,
        text=request.text,
        created_at=datetime.utcnow(),
        image=base64_image,
        song=song_list
    )
    
    # MongoDB 저장
    result = diary_collection.insert_one(diary.dict())
    return diary


@router.post("/select-song")
def select_song(user_id: str, diary_id: str, song: Song):
    '''LP에 음악 추가'''
    diary = diary_collection.find_one({"_id": ObjectId(diary_id), "user_id": user_id})
    if not diary:
        raise HTTPException(status_code=404, detail="LP not found")
    
    # 음악 정보 추가
    diary_collection.update_one(
        {"_id": ObjectId(diary_id)},
        {"$set": {"song": song.dict()}} 
    )
    return {"message": "Song added to LP successfully"}

@router.get("/download")
def download_diary(user_id: str, diary_id: str):
    '''LP 이미지 다운로드'''
    diary = diary_collection.find_one({"_id": ObjectId(diary_id), "user_id": user_id})
    if not diary:
        raise HTTPException(status_code=404, detail="LP not found")
    return diary["image"]