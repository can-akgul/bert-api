import { useEffect } from 'react'
import './App.css'
import bookmarkIcon from './assets/bookmark.svg'
import { useAppDispatch } from './hooks/redux'
import { useNewsState, useUIState, useBookmarkState } from './hooks/redux'
import { 
  setNewsText, 
  setGenerateText, 
  setFilters, 
  predictNews, 
  generateNews, 
  setPredictResultsFromGenerated,
  clearPredictResults 
} from './store/slices/newsSlice'
import { setActiveTab, toggleBookmarks, setShowBookmarks } from './store/slices/uiSlice'
import { togglePredictionBookmark, removeBookmark, addBookmark as addBookmarkAction } from './store/slices/bookmarkSlice'
import { showToastMessage } from './utils/toast'

function App() {
  const dispatch = useAppDispatch()
  const newsState = useNewsState()
  const uiState = useUIState()
  const bookmarkState = useBookmarkState()

  const {
    newsText,
    generateText,
    generatedNews,
    predictResult,
    bertResult,
    geminiResult,
    filters,
    contentOptions,
    styleOptions,
    lengthOptions,
    predictLoading,
    generateLoading
  } = newsState

  const { activeTab, showBookmarks, toast } = uiState
  const { bookmarks, isBookmarked, currentBookmarkId } = bookmarkState

  const loading = predictLoading || generateLoading

  const handlePredict = async () => {
    if (!newsText.trim()) return
    
    dispatch(clearPredictResults())
    dispatch(predictNews(newsText))
  }

  const handlePredictGenerated = () => {
    dispatch(setPredictResultsFromGenerated())
    dispatch(setActiveTab('predict'))
  }

  const addBookmark = (text, type) => {
    const bookmark = {
      text: text,
      type: type
    }
    dispatch(addBookmarkAction(bookmark))
    dispatch(showToastMessage('Bookmarks saved'))
  }

  const handleTogglePredictionBookmark = () => {
    if (!bertResult || !geminiResult) return
    
    dispatch(togglePredictionBookmark({ newsText, bertResult, geminiResult }))
    
    const message = isBookmarked ? 'Bookmark removed' : 'Bookmarked'
    dispatch(showToastMessage(message))
  }

  const handleRemoveBookmark = (id) => {
    dispatch(removeBookmark(id))
  }

  const handleGenerate = async () => {
    const options = {
      context: filters.content,
      style: filters.style,
      length: filters.length,
      additional_context: generateText
    }
    dispatch(generateNews(options))
  }

  return (
    <div className="app">
      <div className="container">
        {/* Title with Bookmarks */}
        <div className="title-container">
          <h1 className="app-title">Fake News Detector</h1>
          <button 
            className="bookmarks-toggle"
            onClick={() => dispatch(toggleBookmarks())}
            title="Bookmarks"
          >
            <img src={bookmarkIcon} alt="Bookmarks" className="bookmark-icon" />
          </button>
        </div>
        
        {/* Tab Buttons */}
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveTab('predict'))}
          >
            Predict
          </button>
          <button 
            className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveTab('generate'))}
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
              onChange={(e) => dispatch(setNewsText(e.target.value))}
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
                  onClick={handleTogglePredictionBookmark}
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
                onChange={(e) => dispatch(setFilters({content: e.target.value}))}
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
                onChange={(e) => dispatch(setFilters({style: e.target.value}))}
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
                onChange={(e) => dispatch(setFilters({length: e.target.value}))}
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
              onChange={(e) => dispatch(setGenerateText(e.target.value))}
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
                  onClick={() => dispatch(setShowBookmarks(false))}
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
                          onClick={() => handleRemoveBookmark(bookmark.id)}
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
