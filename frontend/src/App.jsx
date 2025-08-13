import { useState, useRef } from 'react'
import './App.css'
import bookmarkIcon from './assets/bookmark.svg'

function App() {
  const [activeTab, setActiveTab] = useState('predict')
  const [newsText, setNewsText] = useState('')
  const [predictResult, setPredictResult] = useState('')
  const [bertResult, setBertResult] = useState('')
  const [geminiResult, setGeminiResult] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [currentBookmarkId, setCurrentBookmarkId] = useState(null)
  const [generateText, setGenerateText] = useState('')
  const [generatedNews, setGeneratedNews] = useState('')
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimeoutRef = useRef(null)
  const [filters, setFilters] = useState({
    content: '',
    style: '',
    length: ''
  })

  const contentOptions = [
    { value: '', label: 'Select Content' },
    { value: 'politics', label: 'Politics' },
    { value: 'technology', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'environment', label: 'Environment' }
  ]

  const styleOptions = [
    { value: '', label: 'Select Style' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'sensational', label: 'Sensational' },
    { value: 'clickbait', label: 'Clickbait' },
    { value: 'misleading', label: 'Misleading' },
    { value: 'investigative', label: 'Investigative' },
    { value: 'satirical', label: 'Satirical' },
    { value: 'humorous', label: 'Humorous' }
  ]

  const lengthOptions = [
    { value: '', label: 'Select Length' },
    { value: 'short', label: 'Short(50 words)' },
    { value: 'medium', label: 'Medium(100 words)' },
    { value: 'long', label: 'Long(200 words)' }
  ]
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    if (!newsText.trim()) return
    
    setLoading(true)
    setBertResult('')
    setGeminiResult('')
    setPredictResult('')
    setIsBookmarked(false)
    setCurrentBookmarkId(null)
    
    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ news: newsText }),
      })
      const result = await response.json()
      setBertResult(result.custom_model)
      setGeminiResult(result.gemini_model)
      setPredictResult('completed')
    } catch (error) {
      setPredictResult('Error occurred while predicting')
    }
    setLoading(false)
  }

  const handlePredictGenerated = () => {
    setNewsText(generatedNews)
    setActiveTab('predict')
    setPredictResult('')
    setBertResult('')
    setGeminiResult('')
    setIsBookmarked(false)
    setCurrentBookmarkId(null)
  }

  const addBookmark = (text, type) => {
    const bookmark = {
      id: Date.now(),
      text: text,
      type: type,
      timestamp: new Date().toLocaleString()
    }
    setBookmarks([bookmark, ...bookmarks])
    // Toast notify
    setToast('Bookmarks saved')
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(''), 2000)
  }

  const togglePredictionBookmark = () => {
    if (!bertResult || !geminiResult) return
    
    if (isBookmarked && currentBookmarkId) {
      // Remove bookmark
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== currentBookmarkId))
      setIsBookmarked(false)
      setCurrentBookmarkId(null)
      // Toast notify
      setToast('Bookmark removed')
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setToast(''), 2000)
    } else {
      // Add bookmark
      const bookmarkId = Date.now()
      const bookmark = {
        id: bookmarkId,
        text: newsText,
        type: 'prediction',
        bertResult: bertResult,
        geminiResult: geminiResult,
        timestamp: new Date().toLocaleString()
      }
      setBookmarks([bookmark, ...bookmarks])
      setIsBookmarked(true)
      setCurrentBookmarkId(bookmarkId)
      // Toast notify
      setToast('Bookmarked')
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setToast(''), 2000)
    }
  }

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: filters.content,
          style: filters.style,
          length: filters.length,
          additional_context: generateText
        }),
      })
      const result = await response.text()
      setGeneratedNews(result)
    } catch (error) {
      setGeneratedNews('Error occurred while generating')
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <div className="container">
        {/* Title with Bookmarks */}
        <div className="title-container">
          <h1 className="app-title">Fake News Detector</h1>
          <button 
            className="bookmarks-toggle"
            onClick={() => setShowBookmarks(!showBookmarks)}
            title="Bookmarks"
          >
            <img src={bookmarkIcon} alt="Bookmarks" className="bookmark-icon" />
          </button>
        </div>
        
        {/* Tab Buttons */}
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            Predict
          </button>
          <button 
            className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate
          </button>
        </div>

        {/* Predict Section */}
        {activeTab === 'predict' && (
          <div className="section">
            <textarea
              className="text-area"
              placeholder="Enter news text to analyze..."
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              rows={6}
            />
            <button 
              className="action-button"
              onClick={handlePredict}
              disabled={loading || !newsText.trim()}
            >
              {loading ? 'Detecting...' : 'Detect'}
            </button>
            
            {(bertResult || geminiResult) && (
              <div className="predictions-container">
                <div className="prediction-section">
                  <div className="prediction-header">
                    <h3>Fine-tuned BERT MODEL</h3>
                  </div>
                  <div className={`prediction-result ${bertResult.toLowerCase()}`}>
                    {bertResult ? bertResult.toUpperCase() : 'Loading...'}
                  </div>
                </div>
                
                <div className="prediction-section">
                  <div className="prediction-header">
                    <h3>GEMİNİ MODEL</h3>
                  </div>
                  <div className={`prediction-result ${geminiResult.toLowerCase()}`}>
                    {geminiResult ? geminiResult.toUpperCase() : 'Loading...'}
                  </div>
                </div>
              </div>
            )}
            
            {(bertResult && geminiResult) && (
              <div className="prediction-bookmark-container">
                <button 
                  className={`bookmark-btn prediction-main-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={togglePredictionBookmark}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark both predictions'}
                >
                  <img src={bookmarkIcon} alt="Bookmark" className="bookmark-icon" />
                  {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Generate Section */}
        {activeTab === 'generate' && (
          <div className="section">
            <div className="filters">
              <select
                className="filter-select"
                value={filters.content}
                onChange={(e) => setFilters({...filters, content: e.target.value})}
              >
                {contentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={filters.style}
                onChange={(e) => setFilters({...filters, style: e.target.value})}
              >
                {styleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={filters.length}
                onChange={(e) => setFilters({...filters, length: e.target.value})}
              >
                {lengthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              className="text-input"
              placeholder="Enter context for news generation (optional)..."
              value={generateText}
              onChange={(e) => setGenerateText(e.target.value)}
            />
            <button 
              className="action-button"
              onClick={handleGenerate}
              disabled={loading || !filters.content || !filters.style || !filters.length}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
            {generatedNews && (
              <div className="generated-result">
                {generatedNews}
                <div className="generated-actions">
                  <button 
                    className="predict-generated-btn"
                    onClick={handlePredictGenerated}
                    title="Predict this generated news"
                  >
                    Predict This →
                  </button>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Overlay */}
        {showBookmarks && (
          <div className="bookmarks-overlay">
            <div className="bookmarks-modal">
              <div className="bookmarks-header">
                <h2>Bookmarks</h2>
                <button 
                  className="close-bookmarks"
                  onClick={() => setShowBookmarks(false)}
                >
                  ✕
                </button>
              </div>
              {bookmarks.length === 0 ? (
                <div className="empty-bookmarks">No bookmarks yet</div>
              ) : (
                <div className="bookmarks-list">
                  {bookmarks.map(bookmark => (
                    <div key={bookmark.id} className="bookmark-item">
                      <div className="bookmark-header">
                        {bookmark.type === 'prediction' ? (
                          <div className="prediction-labels">
                            <span className={`prediction-label bert ${bookmark.bertResult?.toLowerCase() || 'unknown'}`}>
                              BERT: {bookmark.bertResult?.toUpperCase() || 'N/A'}
                            </span>
                            <span className={`prediction-label gemini ${bookmark.geminiResult?.toLowerCase() || 'unknown'}`}>
                              GEMINI: {bookmark.geminiResult?.toUpperCase() || 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <span className={`bookmark-type ${bookmark.type}`}>
                            {bookmark.type === 'generated' ? 'Generated' : bookmark.type.toUpperCase()}
                          </span>
                        )}
                        <span className="bookmark-time">{bookmark.timestamp}</span>
                      </div>
                      <div className="bookmark-text">{bookmark.text}</div>
                      {bookmark.type !== 'generated' && (
                        <button 
                          className="remove-bookmark"
                          onClick={() => removeBookmark(bookmark.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      {/* Toast */}
      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  </div>
  )
}

export default App
