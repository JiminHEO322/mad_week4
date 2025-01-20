from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import Optional

class User(BaseModel):
    user_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Song(BaseModel):
    title: str
    artist: str

class LP(BaseModel):
    user_id: str
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    image: Optional[str]
    song: Optional[Song] = None