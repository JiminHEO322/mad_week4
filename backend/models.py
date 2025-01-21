from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import Optional, List

class User(BaseModel):
    user_id: Optional[str] = None
    user_name: str
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Song(BaseModel):
    title: str
    artist: str

class LP(BaseModel):
    user_id: str
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    image: Optional[str]
    song: List[Song] = []