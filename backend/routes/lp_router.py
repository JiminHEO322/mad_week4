import base64
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from database import diary_collection
from models import LP, Song

from services.image_gen import generate_image
from services.song_gen import recommend_song
from services.prompt_gen import english_translation, mood_extraction, keyword_extraction

from bson import ObjectId

router = APIRouter() 


@router.get("/diary")
def get_diary(user_id: str, diary_id: str):
    '''특정 LP 조회'''
    diary = diary_collection.find_one({"_id": ObjectId(diary_id), "user_id": user_id})
    if not diary:
        raise HTTPException(status_code=404, detail="LP not found")
    diary["_id"] = str(diary["_id"])
    return diary


@router.post("/generate")
def generate_diary(user_id: str, text: str):
    '''LP 커버 생성 및 노래 추천'''
    translated_text = english_translation(text)
    print(f"Translated text: {translated_text}")
    mood = mood_extraction(translated_text)
    print(f"Detected mood: {mood}")
    keyword = keyword_extraction(translated_text)
    print(f"Detected keyword: {keyword}")
    prompt = f"vinyl record cover in a {mood} style, featuring {keyword}"
    
    # Hugging Face 이미지 생성
    image = generate_image(prompt)
    if image:
        # 이미지 저장 경로 설정
        save_dir = "images"
        os.makedirs(save_dir, exist_ok=True)  # 디렉토리 없으면 생성
        file_path = os.path.join(save_dir, f"{keyword}.png")
        
        # Base64로 변환
        base64_image = base64.b64encode(image).decode("utf-8")

        # 이미지 파일로 저장
        with open(file_path, "wb") as f:
            f.write(image)
        
        print(f"Image saved at: {file_path}")
    else:
        print("Image generation failed.")
    
    # Spotify 추천 음악 가져오기
    recommended_songs = recommend_song(mood)
    print(f"Recommended songs: {recommended_songs}")

    # MongoDB에 저장할 데이터
    diary = LP(
        user_id=user_id,
        text=text,
        created_at=datetime.utcnow(),
        image=base64_image
    )
    
    # MongoDB 저장
    result = diary_collection.insert_one(diary.dict())
    return {"id": str(result.inserted_id),
            "image": base64_image,
            "song": recommended_songs}

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