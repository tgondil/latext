import React from 'react';
import 'katex/dist/katex.min.css';
import './LatexRenderer.css';

function LatexRenderer({ latex, isLoading, error, progress }) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h4>AI is crafting your academic paper...</h4>
          <p>Using advanced chain-of-thought reasoning to create professional content</p>
          {progress.total > 1 && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
              <span className="progress-text">
                Processing chunk {progress.current + 1} of {progress.total}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h4>AI Enhancement Error</h4>
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
        <h4>Your academic paper will appear here</h4>
        <p>Start typing in the input field to see the LaTeX-formatted paper preview</p>
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
  // Simple LaTeX to HTML conversion for preview
  // In a real implementation, you might use a proper LaTeX parser
  return latex
    .replace(/\\documentclass\{article\}[\s\S]*?\\begin\{document\}/g, '')
    .replace(/\\end\{document\}/g, '')
    .replace(/\\title\{([^}]+)\}/g, '<h1 class="paper-title">$1</h1>')
    .replace(/\\author\{([^}]+)\}/g, '<p class="paper-author">$1</p>')
    .replace(/\\date\{([^}]+)\}/g, '<p class="paper-date">$1</p>')
    .replace(/\\maketitle/g, '<hr class="title-separator">')
    .replace(/\\section\{([^}]+)\}/g, '<h2 class="paper-section">$1</h2>')
    .replace(/\\subsection\{([^}]+)\}/g, '<h3 class="paper-subsection">$1</h3>')
    .replace(/\\paragraph\{([^}]+)\}/g, '<h4 class="paper-paragraph">$1</h4>')
    .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\cite\{([^}]+)\}/g, '<sup class="citation">[$1]</sup>')
    .replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, '<div class="abstract"><h3>Abstract</h3><p>$1</p></div>')
    .replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
      const items = content.replace(/\\item\s+/g, '<li>').replace(/\n\s*(?=<li>)/g, '</li>\n');
      return `<ul class="paper-list">${items}</li></ul>`;
    })
    .replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
      const items = content.replace(/\\item\s+/g, '<li>').replace(/\n\s*(?=<li>)/g, '</li>\n');
      return `<ol class="paper-list">${items}</li></ol>`;
    })
    .replace(/\n\s*\n/g, '</p>\n<p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6])/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<div|<hr|<ul|<ol)/g, '$1')
    .replace(/(<\/div>|<\/ul>|<\/ol>)<\/p>/g, '$1');
}

export default LatexRenderer; 