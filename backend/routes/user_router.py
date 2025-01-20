from datetime import datetime
from fastapi import APIRouter, HTTPException
from database import user_collection
from models import User

from bson import ObjectId

router = APIRouter() 


@router.post("/user")
def save_diary(user_name: str):
    user = User(
        user_name=user_name,
        created_at=datetime.utcnow()
    )
    result = user_collection.insert_one(user.dict())
    return {"inserted_id": str(result.inserted_id)}