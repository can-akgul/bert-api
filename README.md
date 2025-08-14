# 🔍 Fake News Detector

A powerful AI-powered fake news detection system that integrates a fine-tuned DistilBERT model trained on the LIAR dataset and Google’s Gemini 2.5 Flash model to deliver comprehensive news analysis and generation capabilities.
## Prerequisites
- Google Gemini API Key

## How to run the app?

### Backend Setup
- Clone the repository
- Create virtual environment: `python -m venv venv`
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`
- Setup your .env file
- Run the backend: `uvicorn main:app --reload`

### Frontend Setup
- Navigate to frontend: `cd frontend`
- Install dependencies: `npm install`
- Run the frontend: `npm run dev`

Visit `http://localhost:5173` to access the application.

# Preview of the app

[<video src="video.mp4" controls width="600"></video>](https://github.com/user-attachments/assets/6689bb81-eda5-437f-ae19-745290f978f5)
