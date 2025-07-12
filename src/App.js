import React, { useState, useCallback, useRef } from 'react';
import TextInput from './components/TextInput';
import LatexRenderer from './components/LatexRenderer';
import { convertToLatex } from './utils/textToLatex';
import geminiService from './services/geminiService';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [latexOutput, setLatexOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [useGemini, setUseGemini] = useState(true);
  const debounceRef = useRef(null);

  const handleTextChange = useCallback(async (text) => {
    setInputText(text);
    setError('');
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // If text is empty, clear output
    if (!text.trim()) {
      setLatexOutput('');
      return;
    }
    
    // Debounce API calls for better UX
    debounceRef.current = setTimeout(async () => {
      try {
        if (useGemini) {
          setIsLoading(true);
          setProgress({ current: 0, total: 1 });
          
          const latex = await geminiService.convertToAcademicPaper(
            text, 
            (current, total) => {
              setProgress({ current, total });
            }
          );
          
          setLatexOutput(latex);
        } else {
          // Fallback to original conversion
          const latex = convertToLatex(text);
          setLatexOutput(latex);
        }
      } catch (error) {
        console.error('Error converting text:', error);
        setError(error.message || 'Failed to convert text to LaTeX');
        
        // Fallback to original conversion on error
        const latex = convertToLatex(text);
        setLatexOutput(latex);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1 second debounce
  }, [useGemini]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>LaText</h1>
        <p>Transform your text into beautiful academic papers with AI</p>
        <div className="header-controls">
          <label className="ai-toggle">
            <input
              type="checkbox"
              checked={useGemini}
              onChange={(e) => setUseGemini(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">AI Enhancement</span>
          </label>
        </div>
      </header>
      
      <div className="app-content">
        <div className="input-section">
          <TextInput 
            value={inputText}
            onChange={handleTextChange}
            placeholder="Enter your text here to convert it into an academic paper..."
          />
        </div>
        
        <div className="output-section">
          <LatexRenderer 
            latex={latexOutput}
            isLoading={isLoading}
            error={error}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
}

export default App; 