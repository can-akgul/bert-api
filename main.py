from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from fastapi.responses import PlainTextResponse
import os
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer

load_dotenv(override=True)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", None)
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
AGENT_SYSTEM   = os.getenv("AGENT_SYSTEM", "")
AGENT_STYLE    = os.getenv("AGENT_STYLE", "")

if not GEMINI_API_KEY:
    raise ValueError("KEY NOT FOUND")

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI()


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
    prompt = f"""
Context: {req.context}
Style: {req.style}
Length: {req.length}

Please generate a news based on the context, style and length. No heading, no footer, no author, no date, no source.
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