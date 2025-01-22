from pydantic import BaseModel
from models import Song

class DiaryRequest(BaseModel):
    user_id: str
    text: str

class SongSelectRequest(BaseModel):
    user_id: str
    diary_id: str
    song: Song