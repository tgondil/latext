import React, { useState } from 'react';
import TextInput from './components/TextInput';
import LatexRenderer from './components/LatexRenderer';
import { convertToLatex } from './utils/textToLatex';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [latexOutput, setLatexOutput] = useState('');

  const handleTextChange = (text) => {
    setInputText(text);
    const latex = convertToLatex(text);
    setLatexOutput(latex);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>LaText</h1>
        <p>Transform your text into beautiful academic papers</p>
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
          <LatexRenderer latex={latexOutput} />
        </div>
      </div>
    </div>
  );
}

export default App; 