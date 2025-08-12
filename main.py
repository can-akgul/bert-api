from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from fastapi.responses import PlainTextResponse
import os
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
import uvicorn

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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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




class GeminiRequest(BaseModel):
    context: str
    style: str
    length: str

class PredictionRequest(BaseModel):
    news: str


@app.post("/generate", response_class=PlainTextResponse)
def generate_news(req: GeminiRequest):

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
    
    
    prompt = f"""
You MUST generate a news article about {content_specs.get(req.context, req.context)} ONLY.

STRICT REQUIREMENTS:
1. CONTENT: The article MUST be about {req.context.upper()} - do not write about any other topic
2. STYLE: Use {style_specs[req.style]} tone
3. LENGTH: Write exactly {length_specs[req.length]}

CRITICAL: The article must be specifically about {content_specs.get(req.context, req.context)}. Do not deviate from this topic.

Write only the news content (no title, byline, date, or source).
    """.strip()

    resp = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={"temperature": 0.7}
    )

    return (resp.text or "").strip()


@app.post("/predict", response_class=PlainTextResponse)
def predict(req: PredictionRequest):
    return prediction_model(req.news)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)