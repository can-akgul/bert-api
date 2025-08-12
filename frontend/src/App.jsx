import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('predict')
  const [newsText, setNewsText] = useState('')
  const [predictResult, setPredictResult] = useState('')
  const [generateText, setGenerateText] = useState('')
  const [generatedNews, setGeneratedNews] = useState('')
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

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: generateText || 'Generate news',
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
              <div className={`result ${predictResult.toLowerCase()}`}>
                Result: {predictResult.toUpperCase()}
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
