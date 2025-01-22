from pydantic import BaseModel
from models import Song
from datetime import datetime

class DiaryRequest(BaseModel):
    user_id: str
    text: str

class SongSelectRequest(BaseModel):
    user_id: str
    diary_id: str
    song: Song

class FavoriteUpdateRequest(BaseModel):
    user_id: str
    text: str
    favorite: bool