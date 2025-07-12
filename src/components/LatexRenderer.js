import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import LaTeX from 'react-latex-next';
import './LatexRenderer.css';

function LatexRenderer({ latex, isLoading, error, progress, isProgressive }) {
  const [viewMode, setViewMode] = useState('compiled'); // 'source', 'rendered', 'document', 'compiled'
  const [compiledLatex, setCompiledLatex] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Compile LaTeX when content changes
  useEffect(() => {
    if (latex && viewMode === 'compiled') {
      compileLatex(latex);
    }
  }, [latex, viewMode]);

  const compileLatex = async (latexContent) => {
    if (!latexContent) return;
    
    setIsCompiling(true);
    try {
      // Clean the LaTeX content for compilation
      const cleanLatex = latexContent
        .replace(/\\documentclass\[[^\]]*\]\{[^}]*\}/g, '') // Remove document class
        .replace(/\\usepackage\{[^}]*\}/g, '') // Remove usepackage commands
        .replace(/\\begin\{document\}/g, '') // Remove begin document
        .replace(/\\end\{document\}/g, '') // Remove end document
        .replace(/\\maketitle/g, '') // Remove maketitle
        .replace(/\\thispagestyle\{[^}]*\}/g, '') // Remove page style
        .trim();

      setCompiledLatex(cleanLatex);
    } catch (error) {
      console.error('LaTeX compilation error:', error);
    } finally {
      setIsCompiling(false);
    }
  };
  
  const renderContent = () => {
    // Show progressive content being built
    if (latex && (isLoading || isProgressive)) {
      return (
        <div className="progressive-container">
          <div className="latex-paper">
            {renderLatexContent(latex)}
          </div>
          <div className="progressive-indicator">
            {isProgressive && (
              <div className="progressive-status">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="progressive-text">Building research paper progressively...</span>
              </div>
            )}
            {isLoading && (
              <div className="loading-footer">
                <div className="loading-spinner-small"></div>
                <span className="loading-text">
                  {isProgressive ? 'Adding more content...' : 'Processing your text...'}
                </span>
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
          <h4>Converting to research paper format...</h4>
          <p>Processing your text with professional academic formatting and multi-page support</p>
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
        <h4>Your visually stunning research paper will appear here</h4>
        <p>Start typing to see your text converted to a beautifully formatted, publication-ready research paper</p>
        <div className="feature-preview">
          <div className="feature-item">
            <strong>Visual Excellence:</strong> Publication-quality formatting with advanced LaTeX typography and elegant spacing
          </div>
          <div className="feature-item">
            <strong>Professional Structure:</strong> Automatic sections, abstracts, citations, and academic formatting
          </div>
          <div className="feature-item">
            <strong>Advanced Typography:</strong> Beautiful emphasis, boxes, visual separators, and enhanced readability
          </div>
          <div className="feature-item">
            <strong>True LaTeX Rendering:</strong> Four view modes including actual LaTeX compilation and PDF-like rendering
          </div>
          <div className="feature-item">
            <strong>Progressive Building:</strong> Watch your document build in real-time with multiple AI requests
          </div>
          <div className="feature-item">
            <strong>Mathematical Beauty:</strong> Elegant equation formatting and proper mathematical notation
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
      
      case 'document':
        return renderAsDocument(latexCode);
        
      case 'compiled':
        return renderCompiledLatex();
      
      default:
        return renderCompiledLatex();
    }
  };

  const renderCompiledLatex = () => {
    if (isCompiling) {
      return (
        <div className="compilation-loading">
          <div className="loading-spinner-small"></div>
          <span>Compiling LaTeX...</span>
        </div>
      );
    }

    if (!compiledLatex) {
      return (
        <div className="no-content">
          <p>No LaTeX content to compile</p>
        </div>
      );
    }

    return (
      <div className="compiled-latex-container">
        <div className="compiled-latex-page">
          <LaTeX>{compiledLatex}</LaTeX>
        </div>
      </div>
    );
  };

  const renderAsDocument = (latexCode) => {
    // Create a proper document rendering that looks like a LaTeX PDF
    const documentData = parseLatexDocument(latexCode);
    
    return (
      <div className="latex-document">
        <div className="document-page">
          {/* Document Header */}
          {documentData.title && (
            <div className="document-header">
              <h1 className="document-title">{documentData.title}</h1>
              {documentData.author && <p className="document-author">{documentData.author}</p>}
              {documentData.date && <p className="document-date">{documentData.date}</p>}
            </div>
          )}
          
          {/* Document Content */}
          <div className="document-content">
            {documentData.content.map((section, index) => (
              <div key={index} className="document-section">
                {section.type === 'pagebreak' && (
                  <div className="document-pagebreak">
                    <div className="pagebreak-line"></div>
                    <span className="pagebreak-text">Page {section.pageNumber}</span>
                  </div>
                )}
                {section.type === 'heading' && (
                  <div className={`document-heading level-${section.level}`}>
                    {section.content}
                  </div>
                )}
                {section.type === 'paragraph' && (
                  <p className="document-paragraph">
                    {renderInlineContent(section.content)}
                  </p>
                )}
                {section.type === 'list' && (
                  <div className={`document-list ${section.listType}`}>
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="document-list-item">
                        {renderInlineContent(item)}
                      </div>
                    ))}
                  </div>
                )}
                {section.type === 'math' && (
                  <div className="document-math">
                    {section.display ? (
                      <BlockMath math={section.content} />
                    ) : (
                      <InlineMath math={section.content} />
                    )}
                  </div>
                )}
                {section.type === 'quote' && (
                  <blockquote className="document-quote">
                    {renderInlineContent(section.content)}
                  </blockquote>
                )}
                {section.type === 'abstract' && (
                  <div className="document-abstract">
                    <h3 className="abstract-title">Abstract</h3>
                    <div className="abstract-content">
                      {renderInlineContent(section.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInlineContent = (content) => {
    if (!content) return null;
    
    // Handle inline formatting and math
    const parts = content.split(/(\$[^$]+\$|\\textbf\{[^}]+\}|\\textit\{[^}]+\}|\\emph\{[^}]+\}|\\underline\{[^}]+\}|\\texttt\{[^}]+\})/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return <InlineMath key={index} math={mathContent} />;
      } else if (part.startsWith('\\textbf{') && part.endsWith('}')) {
        const boldContent = part.slice(8, -1);
        return <strong key={index}>{boldContent}</strong>;
      } else if (part.startsWith('\\textit{') && part.endsWith('}')) {
        const italicContent = part.slice(8, -1);
        return <em key={index}>{italicContent}</em>;
      } else if (part.startsWith('\\emph{') && part.endsWith('}')) {
        const emphContent = part.slice(6, -1);
        return <em key={index}>{emphContent}</em>;
      } else if (part.startsWith('\\underline{') && part.endsWith('}')) {
        const underlineContent = part.slice(11, -1);
        return <u key={index}>{underlineContent}</u>;
      } else if (part.startsWith('\\texttt{') && part.endsWith('}')) {
        const codeContent = part.slice(8, -1);
        return <code key={index}>{codeContent}</code>;
      }
      return part;
    });
  };

  const parseLatexDocument = (latex) => {
    const document = {
      title: '',
      author: '',
      date: '',
      content: []
    };
    
    let currentPage = 1;
    
    // Extract title, author, date
    const titleMatch = latex.match(/\\title\{([^}]+)\}/);
    if (titleMatch) document.title = titleMatch[1];
    
    const authorMatch = latex.match(/\\author\{([^}]+)\}/);
    if (authorMatch) document.author = authorMatch[1];
    
    const dateMatch = latex.match(/\\date\{([^}]+)\}/);
    if (dateMatch) document.date = dateMatch[1];
    
    // Clean content (remove preamble and document structure)
    let content = latex
      .replace(/\\documentclass\{[^}]+\}[\s\S]*?\\begin\{document\}/g, '')
      .replace(/\\end\{document\}/g, '')
      .replace(/\\usepackage\{[^}]+\}/g, '')
      .replace(/\\title\{[^}]+\}/g, '')
      .replace(/\\author\{[^}]+\}/g, '')
      .replace(/\\date\{[^}]+\}/g, '')
      .replace(/\\maketitle/g, '')
      .replace(/\\thispagestyle\{[^}]+\}/g, '')
      .trim();
    
    // Split into sections and parse
    const lines = content.split('\n');
    let currentParagraph = '';
    let inList = false;
    let listItems = [];
    let listType = '';
    let inAbstract = false;
    let abstractContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (currentParagraph) {
          document.content.push({
            type: 'paragraph',
            content: currentParagraph.trim()
          });
          currentParagraph = '';
        }
        continue;
      }
      
      // Handle page breaks
      if (line.match(/\\newpage|\\clearpage|\\pagebreak/)) {
        currentPage++;
        document.content.push({
          type: 'pagebreak',
          pageNumber: currentPage
        });
        continue;
      }
      
      // Handle sections
      if (line.startsWith('\\section{')) {
        const sectionTitle = line.match(/\\section\{([^}]+)\}/)[1];
        document.content.push({
          type: 'heading',
          level: 1,
          content: sectionTitle
        });
        continue;
      }
      
      if (line.startsWith('\\subsection{')) {
        const subsectionTitle = line.match(/\\subsection\{([^}]+)\}/)[1];
        document.content.push({
          type: 'heading',
          level: 2,
          content: subsectionTitle
        });
        continue;
      }
      
      if (line.startsWith('\\subsubsection{')) {
        const subsubsectionTitle = line.match(/\\subsubsection\{([^}]+)\}/)[1];
        document.content.push({
          type: 'heading',
          level: 3,
          content: subsubsectionTitle
        });
        continue;
      }
      
      // Handle abstract
      if (line.includes('\\begin{abstract}')) {
        inAbstract = true;
        abstractContent = line.replace('\\begin{abstract}', '');
        continue;
      }
      
      if (line.includes('\\end{abstract}')) {
        inAbstract = false;
        abstractContent += ' ' + line.replace('\\end{abstract}', '');
        document.content.push({
          type: 'abstract',
          content: abstractContent.trim()
        });
        abstractContent = '';
        continue;
      }
      
      if (inAbstract) {
        abstractContent += ' ' + line;
        continue;
      }
      
      // Handle lists
      if (line.includes('\\begin{itemize}') || line.includes('\\begin{enumerate}')) {
        inList = true;
        listType = line.includes('itemize') ? 'unordered' : 'ordered';
        listItems = [];
        continue;
      }
      
      if (line.includes('\\end{itemize}') || line.includes('\\end{enumerate}')) {
        inList = false;
        document.content.push({
          type: 'list',
          listType: listType,
          items: listItems
        });
        listItems = [];
        continue;
      }
      
      if (inList && line.startsWith('\\item')) {
        listItems.push(line.replace('\\item', '').trim());
        continue;
      }
      
      // Handle quotes
      if (line.includes('\\begin{quote}')) {
        const quoteContent = line.replace('\\begin{quote}', '');
        document.content.push({
          type: 'quote',
          content: quoteContent
        });
        continue;
      }
      
      // Handle display math
      if (line.includes('$$')) {
        const mathContent = line.replace(/\$\$/g, '');
        document.content.push({
          type: 'math',
          display: true,
          content: mathContent
        });
        continue;
      }
      
      // Regular content
      currentParagraph += ' ' + line;
    }
    
    // Add any remaining paragraph
    if (currentParagraph) {
      document.content.push({
        type: 'paragraph',
        content: currentParagraph.trim()
      });
    }
    
    return document;
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
        <h3>Research Paper Document</h3>
        <div className="header-controls">
          <div className="view-mode-tabs">
            <button 
              className={`view-tab ${viewMode === 'source' ? 'active' : ''}`}
              onClick={() => setViewMode('source')}
            >
              LaTeX Source
            </button>
            <button 
              className={`view-tab ${viewMode === 'rendered' ? 'active' : ''}`}
              onClick={() => setViewMode('rendered')}
            >
              Math Rendered
            </button>
            <button 
              className={`view-tab ${viewMode === 'document' ? 'active' : ''}`}
              onClick={() => setViewMode('document')}
            >
              Paper View
            </button>
            <button 
              className={`view-tab ${viewMode === 'compiled' ? 'active' : ''}`}
              onClick={() => setViewMode('compiled')}
            >
              Compiled PDF
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
  
  // Enhanced LaTeX to HTML conversion with multi-page support
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
  
  // Handle page breaks and multi-page formatting
  html = html
    .replace(/\\newpage/g, '<div class="page-break"></div>')
    .replace(/\\clearpage/g, '<div class="page-break clear"></div>')
    .replace(/\\pagebreak/g, '<div class="page-break"></div>');
  
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