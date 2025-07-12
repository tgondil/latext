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
  const [isProgressive, setIsProgressive] = useState(false);
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
        setIsLoading(true);
        setIsProgressive(false);
        setProgress({ current: 0, total: 1 });
        
        const latex = await geminiService.convertToAcademicPaper(
          text, 
          (current, total) => {
            setProgress({ current, total });
          },
          (partialLatex) => {
            // Progressive rendering - update output as chunks are processed
            setIsProgressive(true);
            setLatexOutput(partialLatex);
          }
        );
        
        // Only update if we're not in progressive mode or this is the final result
        if (!isProgressive || latex !== latexOutput) {
          setLatexOutput(latex);
        }
        setIsProgressive(false);
      } catch (error) {
        console.error('Error converting text:', error);
        setError(error.message || 'Failed to convert text to LaTeX');
        
        // Fallback to original conversion on error
        const latex = convertToLatex(text);
        setLatexOutput(latex);
        setIsProgressive(false);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1 second debounce
  }, [latexOutput, isProgressive]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>LaText</h1>
        <p>Transform your text into beautiful academic research papers with professional formatting</p>
      </header>
      
      <div className="app-content">
        <div className="input-section">
          <TextInput 
            value={inputText}
            onChange={handleTextChange}
            placeholder="Enter your text here to convert it into a professionally formatted research paper..."
          />
        </div>
        
        <div className="output-section">
          <LatexRenderer 
            latex={latexOutput}
            isLoading={isLoading}
            error={error}
            progress={progress}
            isProgressive={isProgressive}
          />
        </div>
      </div>
    </div>
  );
}

export default App; 