/**
 * Converts plain text to LaTeX academic paper format
 * @param {string} text - The input text to convert
 * @returns {string} - The formatted LaTeX document
 */
export function convertToLatex(text) {
  if (!text.trim()) {
    return '';
  }

  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  
  if (paragraphs.length === 0) {
    return '';
  }

  // Initialize LaTeX document
  let latex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{hyperref}

`;

  // Extract title from first paragraph or generate one
  const title = extractTitle(paragraphs[0]);
  latex += `\\title{${title}}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

`;

  // Check if we should add an abstract
  if (paragraphs.length > 1) {
    const abstract = generateAbstract(paragraphs);
    if (abstract) {
      latex += `\\begin{abstract}
${abstract}
\\end{abstract}

`;
    }
  }

  // Process remaining paragraphs
  let remainingParagraphs = paragraphs.slice(1);
  
  // If we used first paragraph for title, start from second
  if (title === extractTitle(paragraphs[0]) && paragraphs.length > 1) {
    remainingParagraphs = paragraphs.slice(1);
  } else {
    remainingParagraphs = paragraphs;
  }

  // Convert paragraphs to sections and content
  latex += processContent(remainingParagraphs);

  latex += `\\end{document}`;

  return latex;
}

/**
 * Extracts or generates a title from the first paragraph
 */
function extractTitle(firstParagraph) {
  const text = firstParagraph.trim();
  
  // If it's short and looks like a title, use it
  if (text.length < 100 && !text.includes('.') && !text.includes('?')) {
    return text;
  }
  
  // Extract first sentence as title
  const firstSentence = text.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length < 150) {
    return firstSentence;
  }
  
  // Generate generic title
  const words = text.split(/\s+/).slice(0, 10);
  return words.join(' ') + (words.length === 10 ? '...' : '');
}

/**
 * Generates an abstract from the content
 */
function generateAbstract(paragraphs) {
  if (paragraphs.length < 2) return null;
  
  // Use first paragraph as abstract if it's substantial
  const firstParagraph = paragraphs[0].trim();
  if (firstParagraph.length > 50 && firstParagraph.length < 500) {
    return firstParagraph;
  }
  
  // Generate abstract from key sentences
  const sentences = paragraphs.join(' ').split(/[.!?]/).filter(s => s.trim());
  if (sentences.length > 3) {
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }
  
  return null;
}

/**
 * Processes content paragraphs into LaTeX sections and text
 */
function processContent(paragraphs) {
  if (paragraphs.length === 0) return '';
  
  let latex = '';
  let sectionCount = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    
    if (paragraph.length === 0) continue;
    
    // Check if this paragraph should be a section header
    if (shouldBeSection(paragraph, i, paragraphs.length)) {
      sectionCount++;
      const sectionTitle = generateSectionTitle(paragraph, sectionCount);
      latex += `\\section{${sectionTitle}}\n\n`;
      
      // Add the content of this paragraph if it's more than just a title
      const content = extractContentFromParagraph(paragraph);
      if (content) {
        latex += formatParagraph(content) + '\n\n';
      }
    } else {
      // Regular paragraph
      latex += formatParagraph(paragraph) + '\n\n';
    }
  }
  
  return latex;
}

/**
 * Determines if a paragraph should be treated as a section header
 */
function shouldBeSection(paragraph, index, totalParagraphs) {
  // First paragraph is more likely to be a section
  if (index === 0) return true;
  
  // Short paragraphs that end with colon might be headers
  if (paragraph.length < 100 && paragraph.endsWith(':')) {
    return true;
  }
  
  // If we have many paragraphs, create sections every few paragraphs
  if (totalParagraphs > 4 && index % 3 === 0) {
    return true;
  }
  
  return false;
}

/**
 * Generates a section title from a paragraph
 */
function generateSectionTitle(paragraph, sectionNumber) {
  let title = paragraph.trim();
  
  // Remove trailing colon
  if (title.endsWith(':')) {
    title = title.slice(0, -1);
  }
  
  // If too long, take first part
  if (title.length > 80) {
    const words = title.split(/\s+/);
    title = words.slice(0, 8).join(' ');
    if (words.length > 8) title += '...';
  }
  
  // If still looks like content, generate generic title
  if (title.length > 100 || title.includes('.') && title.split('.').length > 2) {
    const commonTitles = [
      'Introduction',
      'Background',
      'Methodology',
      'Results',
      'Discussion',
      'Analysis',
      'Conclusion',
      'Related Work',
      'Approach',
      'Findings'
    ];
    
    return commonTitles[Math.min(sectionNumber - 1, commonTitles.length - 1)];
  }
  
  return title;
}

/**
 * Extracts content from a paragraph after using part of it as section title
 */
function extractContentFromParagraph(paragraph) {
  const sentences = paragraph.split(/[.!?]/);
  
  // If first sentence was used as title, return the rest
  if (sentences.length > 1) {
    return sentences.slice(1).join('.').trim();
  }
  
  return '';
}

/**
 * Formats a paragraph with LaTeX formatting
 */
function formatParagraph(paragraph) {
  let formatted = paragraph.trim();
  
  // Handle common formatting patterns
  formatted = formatted
    // Bold text (words in ALL CAPS or surrounded by asterisks)
    .replace(/\b[A-Z]{2,}\b/g, '\\textbf{$&}')
    .replace(/\*([^*]+)\*/g, '\\textbf{$1}')
    
    // Italic text (words surrounded by underscores)
    .replace(/_([^_]+)_/g, '\\textit{$1}')
    
    // Simple citations (numbers in brackets)
    .replace(/\[(\d+)\]/g, '\\cite{ref$1}')
    
    // Handle lists
    .replace(/^\s*[-•]\s+/gm, '\\item ')
    .replace(/^\s*\d+\.\s+/gm, '\\item ');
  
  // If paragraph contains list items, wrap in itemize
  if (formatted.includes('\\item')) {
    const items = formatted.split('\\item').filter(item => item.trim());
    if (items.length > 1) {
      formatted = `\\begin{itemize}\n${items.map(item => `\\item ${item.trim()}`).join('\n')}\n\\end{itemize}`;
    }
  }
  
  return formatted;
} 