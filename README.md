# 🔍 Fake News Detector

A powerful AI-powered fake news detection system that combines custom fine-tuned BERT models with Google's Gemini AI to provide comprehensive news analysis and generation capabilities.

## How to run the app?

### Prerequisites
- Google Gemini API Key

### 1. Clone Repository
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your Gemini API key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Run Application
```bash
# Terminal 1: Start backend
python main.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🔧 Configuration

### Environment Variables (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AGENT_SYSTEM=your_system_prompt
AGENT_STYLE=your_style_preferences
```

### API Endpoints

#### POST /predict
Analyze news text with both BERT and Gemini models
```json
{
  "news": "Your news text here"
}
```

**Response:**
```json
{
  "custom_model": "fake",
  "gemini_model": "true",
  "news_text": "Your news text here"
}
```

#### POST /generate
Generate news articles with customizable parameters
```json
{
  "context": "politics",
  "style": "neutral",
  "length": "medium",
  "additional_context": "election campaigns"
}
```

## 🎯 Usage Guide

### 1. News Detection
1. Navigate to the **Predict** tab
2. Enter or paste news text in the textarea
3. Click **Detect** to analyze
4. View results from both AI models
5. **Add Bookmark** to save results
6. **Remove Bookmark** to delete saved predictions

### 2. News Generation
1. Switch to the **Generate** tab
2. Select content category (e.g., Politics, Sports)
3. Choose writing style (e.g., Neutral, Sensational)
4. Pick article length (Short, Medium, Long)
5. Optionally add specific context
6. Click **Generate** to create content
7. Use **Predict This →** to analyze generated content

### 3. Bookmark Management
1. Click the bookmark icon in the top-right corner
2. View all saved predictions with color-coded results
3. Click **Delete** to remove individual bookmarks
4. **Use in Predict** to analyze bookmarked content again

## 🧠 Model Details

### BERT Classifier
- **Base Model**: DistilBERT (distilbert-base-uncased)
- **Architecture**: 
  - Frozen encoder layers
  - Custom classifier: Linear(768→512) → ReLU → Dropout(0.5) → Linear(512→2) → LogSoftmax
- **Training**: Fine-tuned on fake news datasets
- **Performance**: Optimized for real-time inference

### Gemini Integration
- **Model**: Gemini 2.5 Flash
- **Temperature**: 0.1 (low for consistent predictions)
- **Prompt Engineering**: Specialized prompts for news analysis
- **Error Handling**: Graceful fallbacks for API issues

## 🎨 UI Components

### Color Scheme
- **Background**: Deep black (#000000)
- **Cards**: Dark gray (#111111)
- **Borders**: Medium gray (#333333)
- **Text**: Pure white (#ffffff)
- **Accents**: 
  - True/Real: Green (#4ade80)
  - Fake: Red (#f87171)
  - Unknown: Purple (#a78bfa)

### Responsive Breakpoints
- **Desktop**: > 768px (side-by-side layout)
- **Mobile**: ≤ 768px (stacked layout)

## 🔒 Security Features

- **CORS Configuration**: Restricted to localhost during development
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Comprehensive exception management
- **API Rate Limiting**: Built-in FastAPI protections

## 🚀 Deployment

### Production Setup
1. **Backend**: Deploy FastAPI with Gunicorn/Uvicorn
2. **Frontend**: Build with `npm run build` and serve static files
3. **Environment**: Configure production environment variables
4. **Monitoring**: Add logging and health checks

### Docker Support (Optional)
```dockerfile
# Backend Dockerfile example
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face**: For the DistilBERT model and transformers library
- **Google**: For the Gemini AI API
- **FastAPI**: For the high-performance web framework
- **React**: For the modern frontend framework
- **Vite**: For the lightning-fast build tool

## 📞 Support

For questions, issues, or contributions:
- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/fake-news-detector/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/fake-news-detector/discussions)

---

**⚡ Built with AI-powered precision for the fight against misinformation ⚡**
