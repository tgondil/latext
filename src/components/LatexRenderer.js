import React from 'react';
import 'katex/dist/katex.min.css';
import './LatexRenderer.css';

function LatexRenderer({ latex, isLoading, error, progress }) {
  const renderContent = () => {
    // Show content with loading indicator if we have partial content and still loading
    if (latex && isLoading) {
      return (
        <div className="progressive-container">
          <div className="latex-paper">
            <div 
              className="latex-output"
              dangerouslySetInnerHTML={{ __html: renderLatexToHtml(latex) }}
            />
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
          <p>Processing your text and preserving all content</p>
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
          <div 
            className="latex-output"
            dangerouslySetInnerHTML={{ __html: renderLatexToHtml(latex) }}
          />
        </div>
      );
    }

    return (
      <div className="latex-placeholder">
        <div className="placeholder-icon">📄</div>
        <h4>Your LaTeX document will appear here</h4>
        <p>Start typing in the input field to see your text converted to LaTeX format</p>
      </div>
    );
  };

  return (
    <div className="latex-renderer-container">
      <div className="latex-renderer-header">
        <h3>Academic Paper Preview</h3>
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