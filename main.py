from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from dotenv import load_dotenv
from google import genai
import os
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
import uvicorn

# Import our auth and database modules
from database import get_db
from models import User, NewsHistory, GeneratedNews
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    GeminiRequest, PredictionRequest,
    NewsHistoryCreate, GeneratedNewsCreate,
    NewsHistoryResponse, GeneratedNewsResponse
)
from auth import (
    authenticate_user, create_access_token, get_password_hash,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

load_dotenv(override=True)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", None)
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
AGENT_SYSTEM   = os.getenv("AGENT_SYSTEM", "")
AGENT_STYLE    = os.getenv("AGENT_STYLE", "")

if not GEMINI_API_KEY:
    raise ValueError("KEY NOT FOUND")

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da specific domains kullanın
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_model():
    encoder = AutoModel.from_pretrained("distilbert-base-uncased")
    for param in encoder.parameters():
        param.requires_grad = False
    
    classifier = nn.Sequential(
        nn.Linear(768,512),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(512,2),
        nn.LogSoftmax(dim=1)
    )

    return encoder, classifier

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
encoder, classifier = create_model()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

encoder.to(device).eval()
classifier.to(device).eval()

classifier.load_state_dict(torch.load("classifier.pt", map_location=device))

label = {0: "true", 1: "fake"}


def prediction_model(text):
    batch = tokenizer(text, padding=True, truncation=True, max_length=256, return_tensors="pt")
    input_ids = batch["input_ids"].to(device)
    attention_mask = batch["attention_mask"].to(device)
    with torch.no_grad():
        outputs = encoder(input_ids=input_ids, attention_mask=attention_mask)
        sentence = outputs.last_hidden_state[:, 0, :]
        logits = classifier(sentence)
        prediction = torch.argmax(logits, dim=1).item()
        return label[prediction]


def prediction_gemini(text):
    prompt = f"""
Analyze the following news article and determine if it's FAKE or REAL news.

Consider these factors:
1. Factual accuracy and verifiability
2. Source credibility indicators
3. Sensational or misleading language
4. Logical consistency
5. Bias and emotional manipulation

News article to analyze:
"{text}"

Respond with ONLY one word: either "fake" or "true" (lowercase).
    """.strip()
    
    try:
        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={"temperature": 0.1}
        )
        
        result = (resp.text or "").strip().lower()
        # Ensure we return only "fake" or "true"
        if "fake" in result:
            return "fake"
        elif "true" in result or "real" in result:
            return "true"
        else:
            return "none"
    except Exception as e:
        print(f"Gemini prediction error: {e}")
        return "none"




# Schemas are now imported from schemas.py

# ========== AUTH ENDPOINTS ==========

@app.post("/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# ========== USER HISTORY ENDPOINTS ==========

@app.get("/history/news", response_model=list[NewsHistoryResponse])
def get_news_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get user's news prediction history"""
    history = db.query(NewsHistory).filter(
        NewsHistory.user_id == current_user.id
    ).order_by(NewsHistory.created_at.desc()).limit(limit).all()
    
    return history

@app.get("/history/generated", response_model=list[GeneratedNewsResponse])
def get_generated_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get user's generated news history"""
    history = db.query(GeneratedNews).filter(
        GeneratedNews.user_id == current_user.id
    ).order_by(GeneratedNews.created_at.desc()).limit(limit).all()
    
    return history

# ========== PROTECTED ENDPOINTS ==========

@app.post("/generate", response_class=PlainTextResponse)
def generate_news(
    req: GeminiRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    content_specs = {
        'politics': 'politics and current events',
        'technology': 'technology and innovation',
        'sports': 'sports and athletics',
        'entertainment': 'entertainment and media',
        'health': 'health and wellness',
        'science': 'science and technology',
        'environment': 'environment and sustainability',
    }

    length_specs = {
        'short': '1-2 sentences, maximum 50 words',
        'medium': '2-4 sentences, 50-100 words', 
        'long': '4-6 sentences, 100-200 words'
    }
    
    style_specs = {
        'neutral': 'neutral and factual tone',
        'sensational': 'sensational and dramatic tone',
        'clickbait': 'clickbait and sensational tone',
        'misleading': 'misleading and inaccurate tone',
        'investigative': 'investigative and critical tone',
        'satirical': 'satirical and critical tone',
        'humorous': 'humorous and critical tone',
    }
    
    
    base_topic = content_specs.get(req.context, req.context)
    
    # Add additional context if provided
    topic_description = base_topic
    if req.additional_context.strip():
        topic_description = f"{base_topic} with focus on: {req.additional_context.strip()}"
    
    prompt = f"""
You MUST generate a news article about {topic_description} ONLY.

STRICT REQUIREMENTS:
1. CONTENT: The article MUST be about {req.context.upper()} - do not write about any other topic
2. STYLE: Use {style_specs[req.style]} tone
3. LENGTH: Write exactly {length_specs[req.length]}
{f"4. FOCUS: Pay special attention to this context: {req.additional_context.strip()}" if req.additional_context.strip() else ""}

CRITICAL: The article must be specifically about {topic_description}. Do not deviate from this topic.

Write only the news content (no title, byline, date, or source).
    """.strip()

    resp = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={"temperature": 0.7}
    )

    generated_text = (resp.text or "").strip()
    
    # Save to database
    db_generated_news = GeneratedNews(
        user_id=current_user.id,
        context=req.context,
        style=req.style,
        length=req.length,
        additional_context=req.additional_context,
        generated_text=generated_text
    )
    db.add(db_generated_news)
    db.commit()

    return generated_text


@app.post("/predict", response_class=JSONResponse)
def predict(
    req: PredictionRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    custom_prediction = prediction_model(req.news)
    gemini_prediction = prediction_gemini(req.news)
    
    # Save to database
    db_news_history = NewsHistory(
        user_id=current_user.id,
        news_text=req.news,
        custom_prediction=custom_prediction,
        gemini_prediction=gemini_prediction
    )
    db.add(db_news_history)
    db.commit()
    
    return {
        "custom_model": custom_prediction,
        "gemini_model": gemini_prediction,
        "news_text": req.news,
        "user_id": current_user.id
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9999)