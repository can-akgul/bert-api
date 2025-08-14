from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# News Schemas
class NewsHistoryCreate(BaseModel):
    news_text: str
    custom_prediction: str
    gemini_prediction: str

class NewsHistoryResponse(BaseModel):
    id: int
    user_id: int
    news_text: str
    custom_prediction: str
    gemini_prediction: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class GeneratedNewsCreate(BaseModel):
    context: str
    style: str
    length: str
    additional_context: Optional[str] = ""
    generated_text: str

class GeneratedNewsResponse(BaseModel):
    id: int
    user_id: int
    context: str
    style: str
    length: str
    additional_context: Optional[str]
    generated_text: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Request Schemas (existing ones updated)
class GeminiRequest(BaseModel):
    context: str
    style: str
    length: str
    additional_context: str = ""

class PredictionRequest(BaseModel):
    news: str 