from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class User(BaseModel):
    user_id: Optional[str] = None
    user_name: str
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now().astimezone())

class Song(BaseModel):
    title: str
    artist: str
    videoId: Optional[str] = None

class LP(BaseModel):
    user_id: str
    text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now().astimezone())
    favorite: Optional[bool] = False
    image: Optional[str]
    song: Optional[Song] = None