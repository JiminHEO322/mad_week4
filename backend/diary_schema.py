from pydantic import BaseModel

class DiaryRequest(BaseModel):
    user_id: str
    text: str