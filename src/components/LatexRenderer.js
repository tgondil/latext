import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import './LatexRenderer.css';

function LatexRenderer({ latex, isLoading, error, progress }) {
  const [viewMode, setViewMode] = useState('rendered'); // 'source', 'rendered', 'preview'
  const renderContent = () => {
    // Show content with loading indicator if we have partial content and still loading
    if (latex && isLoading) {
      return (
        <div className="progressive-container">
          <div className="latex-paper">
            {renderLatexContent(latex)}
          </div>
          <div className="loading-footer">
            <div className="loading-spinner-small"></div>
            <span className="loading-text">Adding more content...</span>
            {progress.total > 1 && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
                <span className="progress-text">
                  Section {progress.current + 1} of {progress.total}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Show loading state without content
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h4>Converting to LaTeX format...</h4>
          <p>Processing your text with proper LaTeX rendering</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h4>Conversion Error</h4>
          <p>{error}</p>
          <p className="error-fallback">Don't worry! We've generated a paper using our fallback system.</p>
        </div>
      );
    }

    if (latex) {
      return (
        <div className="latex-paper">
          {renderLatexContent(latex)}
        </div>
      );
    }

    return (
      <div className="latex-placeholder">
        <div className="placeholder-icon">📄</div>
        <h4>Your LaTeX document will appear here</h4>
        <p>Start typing to see your text converted to LaTeX with proper math rendering</p>
        <div className="feature-preview">
          <div className="feature-item">
            <strong>Source:</strong> View raw LaTeX code
          </div>
          <div className="feature-item">
            <strong>Rendered:</strong> See math equations properly rendered
          </div>
          <div className="feature-item">
            <strong>Preview:</strong> Document structure preview
          </div>
        </div>
      </div>
    );
  };

  const renderLatexContent = (latexCode) => {
    if (!latexCode) return null;

    switch (viewMode) {
      case 'source':
        return (
          <div className="latex-source">
            <pre className="latex-code">
              <code>{latexCode}</code>
            </pre>
          </div>
        );
      
      case 'rendered':
        return renderLatexWithMath(latexCode);
      
      case 'preview':
        return (
          <div className="latex-output">
            <div dangerouslySetInnerHTML={{ __html: renderLatexToHtml(latexCode) }} />
          </div>
        );
      
      default:
        return renderLatexWithMath(latexCode);
    }
  };

  const renderLatexWithMath = (latexCode) => {
    // Split the LaTeX into text and math parts
    const parts = parseLatexContent(latexCode);
    
    return (
      <div className="latex-rendered">
        {parts.map((part, index) => {
          if (part.type === 'math-display') {
            try {
              return <BlockMath key={index} math={part.content} />;
            } catch (e) {
              return <div key={index} className="math-error">Math Error: {part.content}</div>;
            }
          } else if (part.type === 'math-inline') {
            try {
              return <InlineMath key={index} math={part.content} />;
            } catch (e) {
              return <span key={index} className="math-error">{part.content}</span>;
            }
          } else {
            return (
              <div 
                key={index} 
                className="latex-text-content"
                dangerouslySetInnerHTML={{ __html: renderLatexToHtml(part.content) }}
              />
            );
          }
        })}
      </div>
    );
  };

  const parseLatexContent = (latex) => {
    const parts = [];
    let currentIndex = 0;
    
    // Find display math $$...$$
    const displayMathRegex = /\$\$([^$]+)\$\$/g;
    // Find inline math $...$
    const inlineMathRegex = /\$([^$]+)\$/g;
    
    // First extract display math
    let match;
    let allMatches = [];
    
    while ((match = displayMathRegex.exec(latex)) !== null) {
      allMatches.push({
        type: 'math-display',
        content: match[1],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Then extract inline math (avoiding display math areas)
    let tempLatex = latex;
    allMatches.forEach(m => {
      tempLatex = tempLatex.substring(0, m.start) + '§'.repeat(m.end - m.start) + tempLatex.substring(m.end);
    });
    
    while ((match = inlineMathRegex.exec(tempLatex)) !== null) {
      allMatches.push({
        type: 'math-inline',
        content: latex.substring(match.index + 1, match.index + match[0].length - 1),
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Sort by position
    allMatches.sort((a, b) => a.start - b.start);
    
    // Build parts array
    let lastEnd = 0;
    allMatches.forEach(match => {
      if (match.start > lastEnd) {
        parts.push({
          type: 'text',
          content: latex.substring(lastEnd, match.start)
        });
      }
      parts.push(match);
      lastEnd = match.end;
    });
    
    if (lastEnd < latex.length) {
      parts.push({
        type: 'text',
        content: latex.substring(lastEnd)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: latex }];
  };

  return (
    <div className="latex-renderer-container">
      <div className="latex-renderer-header">
        <h3>LaTeX Document</h3>
        <div className="header-controls">
          <div className="view-mode-tabs">
            <button 
              className={`view-tab ${viewMode === 'source' ? 'active' : ''}`}
              onClick={() => setViewMode('source')}
            >
              Source
            </button>
            <button 
              className={`view-tab ${viewMode === 'rendered' ? 'active' : ''}`}
              onClick={() => setViewMode('rendered')}
            >
              Rendered
            </button>
            <button 
              className={`view-tab ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </button>
          </div>
          <div className="export-buttons">
            <button 
              className="export-btn"
              onClick={() => navigator.clipboard.writeText(latex)}
              disabled={!latex || isLoading}
            >
              Copy LaTeX
            </button>
          </div>
        </div>
      </div>
      <div className="latex-content">
        {renderContent()}
      </div>
    </div>
  );
}

function renderLatexToHtml(latex) {
  if (!latex) return '';
  
  // Enhanced LaTeX to HTML conversion that preserves content structure
  let html = latex;
  
  // Handle document structure
  html = html
    .replace(/\\documentclass\{[^}]+\}[\s\S]*?\\begin\{document\}/g, '')
    .replace(/\\end\{document\}/g, '')
    .replace(/\\usepackage\{[^}]+\}/g, '')
    .replace(/\\title\{([^}]+)\}/g, '<h1 class="paper-title">$1</h1>')
    .replace(/\\author\{([^}]+)\}/g, '<p class="paper-author">$1</p>')
    .replace(/\\date\{([^}]+)\}/g, '<p class="paper-date">$1</p>')
    .replace(/\\maketitle/g, '<hr class="title-separator">');
  
  // Handle sections and structure
  html = html
    .replace(/\\section\{([^}]+)\}/g, '<h2 class="paper-section">$1</h2>')
    .replace(/\\subsection\{([^}]+)\}/g, '<h3 class="paper-subsection">$1</h3>')
    .replace(/\\subsubsection\{([^}]+)\}/g, '<h4 class="paper-subsubsection">$1</h4>')
    .replace(/\\paragraph\{([^}]+)\}/g, '<h5 class="paper-paragraph">$1</h5>');
  
  // Handle text formatting
  html = html
    .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>')
    .replace(/\\texttt\{([^}]+)\}/g, '<code>$1</code>');
  
  // Handle citations and references
  html = html
    .replace(/\\cite\{([^}]+)\}/g, '<sup class="citation">[$1]</sup>')
    .replace(/\\ref\{([^}]+)\}/g, '<span class="reference">$1</span>');
  
  // Handle environments
  html = html
    .replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, '<div class="abstract"><h3>Abstract</h3>$1</div>')
    .replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, '<blockquote class="latex-quote">$1</blockquote>')
    .replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, '<div class="text-center">$1</div>');
  
  // Handle lists
  html = html
    .replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
      const items = content.replace(/\\item\s*/g, '<li>').replace(/\n\s*(?=<li>)/g, '</li>\n');
      return `<ul class="paper-list">${items}</li></ul>`;
    })
    .replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
      const items = content.replace(/\\item\s*/g, '<li>').replace(/\n\s*(?=<li>)/g, '</li>\n');
      return `<ol class="paper-list">${items}</li></ol>`;
    });
  
  // Handle math (basic)
  html = html
    .replace(/\$\$([^$]+)\$\$/g, '<div class="math-display">$$1$</div>')
    .replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>');
  
  // Convert line breaks and paragraphs
  html = html
    .replace(/\n\s*\n/g, '</p>\n<p>')
    .replace(/^(?!<[h1-6]|<div|<ul|<ol|<blockquote)/, '<p>')
    .replace(/(?<!<\/[h1-6]>|<\/div>|<\/ul>|<\/ol>|<\/blockquote>)$/, '</p>');
  
  // Clean up empty paragraphs and fix nesting
  html = html
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6])/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<div|<hr|<ul|<ol|<blockquote)/g, '$1')
    .replace(/(<\/div>|<\/ul>|<\/ol>|<\/blockquote>)<\/p>/g, '$1');
  
  return html;
}

export default LatexRenderer; 