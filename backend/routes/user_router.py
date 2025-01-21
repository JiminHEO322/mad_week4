from datetime import datetime
from fastapi import APIRouter, HTTPException
import requests
from database import user_collection
from models import User
from pydantic import BaseModel
from bson.objectid import ObjectId

router = APIRouter() 

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class GoogleAuthRequest(BaseModel):
    access_token: str

@router.post("/auth/google")
async def google_auth(request: GoogleAuthRequest):
    access_token = request.access_token
    print("Request received:", request)

    if not access_token:
        raise HTTPException(status_code=422, detail="access_token is required")  # 명확한 에러 메시지 추가

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(USERINFO_URL, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google ID Token")

    # 사용자 정보 가져오기
    user_info = response.json()
    email = user_info.get("email")
    name = user_info.get("name")

    if not email or not name:
        raise HTTPException(status_code=400, detail="Invalid user information")

    # 기존 사용자 확인 또는 추가
    existing_user = user_collection.find_one({"email": email})
    if existing_user:
        return {"message": "User already exists", "user_id": str(existing_user["_id"])}

    new_user = User(
        user_name=name,
        email=email,
        created_at=datetime.utcnow(),
    )
    result = user_collection.insert_one(new_user.dict())
    user_id = str(result.inserted_id)
    return {"message": "User created", "user_id": user_id, "name": name, "email": email }