import { useState } from 'react'
import './App.css'
import bookmarkIcon from './assets/bookmark.svg'

function App() {
  const [activeTab, setActiveTab] = useState('predict')
  const [newsText, setNewsText] = useState('')
  const [predictResult, setPredictResult] = useState('')
  const [generateText, setGenerateText] = useState('')
  const [generatedNews, setGeneratedNews] = useState('')
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)
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
    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ news: newsText }),
      })
      const result = await response.text()
      setPredictResult(result)
    } catch (error) {
      setPredictResult('Error occurred while predicting')
    }
    setLoading(false)
  }

  const handlePredictGenerated = () => {
    setNewsText(generatedNews)
    setActiveTab('predict')
    setPredictResult('')
  }

  const addBookmark = (text, type) => {
    const bookmark = {
      id: Date.now(),
      text: text,
      type: type,
      timestamp: new Date().toLocaleString()
    }
    setBookmarks([bookmark, ...bookmarks])
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
          length: filters.length
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
            {predictResult && (
              <div className="result-row">
                <div className={`result ${predictResult.toLowerCase()}`}>
                  Result: {predictResult.toUpperCase()}
                </div>
                <button 
                  className="bookmark-btn result-bookmark"
                  onClick={() => addBookmark(newsText, predictResult)}
                  title="Bookmark this result"
                >
                  <img src={bookmarkIcon} alt="Bookmark" className="bookmark-icon" />
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
                        <span className={`bookmark-type ${bookmark.type}`}>
                          {bookmark.type === 'generated' ? 'Generated' : bookmark.type.toUpperCase()}
                        </span>
                        <span className="bookmark-time">{bookmark.timestamp}</span>
                        <button 
                          className="remove-bookmark"
                          onClick={() => removeBookmark(bookmark.id)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="bookmark-text">{bookmark.text}</div>
                      {bookmark.type !== 'generated' && (
                        <div className="bookmark-actions">
                          <button 
                            className="use-bookmark-btn"
                            onClick={() => {
                              setNewsText(bookmark.text)
                              setActiveTab('predict')
                              setShowBookmarks(false)
                            }}
                          >
                            Use in Predict
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
