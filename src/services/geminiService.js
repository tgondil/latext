import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const getGeminiAPI = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('REACT_APP_GEMINI_API_KEY is not set. Please add your Gemini API key to the .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Direct LaTeX conversion prompt - preserves all content
const LATEX_CONVERSION_PROMPT = `
You are a LaTeX conversion specialist. Your task is to convert the given text directly into properly formatted LaTeX code while preserving ALL original content exactly as provided.

CRITICAL REQUIREMENTS:
- PRESERVE ALL CONTENT: Do not summarize, omit, or rephrase any text
- DIRECT CONVERSION: Convert the text as-is into LaTeX format
- NO RESTRUCTURING: Keep the original organization and flow
- ALL TEXT INCLUDED: Every sentence, paragraph, and detail must be preserved

FORMATTING RULES:
- Convert paragraph breaks to proper LaTeX paragraph spacing
- Apply basic LaTeX formatting: \\textbf{} for emphasis, \\textit{} for italics
- Handle lists with \\begin{itemize} or \\begin{enumerate}
- Use \\section{}, \\subsection{} only if explicitly indicated in the original text
- Preserve exact wording and sentence structure
- Use proper LaTeX escaping for special characters

OUTPUT FORMAT:
- Return ONLY the LaTeX content (no document class, packages, or document environment)
- Start immediately with the converted content
- End cleanly without extra formatting

Convert this text to LaTeX while preserving every word and detail:

`;

// Text chunking strategy for large documents
class TextChunker {
  constructor(maxChunkSize = 3000) {
    this.maxChunkSize = maxChunkSize;
  }

  chunkText(text) {
    if (text.length <= this.maxChunkSize) {
      return [text];
    }

    const chunks = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > this.maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

// Gemini service class
class GeminiService {
  constructor() {
    this.chunker = new TextChunker();
    this.model = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const genAI = getGeminiAPI();
      this.model = genAI.getGenerativeModel({ 
        model: process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: parseInt(process.env.REACT_APP_MAX_TOKENS || '8192'),
          temperature: parseFloat(process.env.REACT_APP_TEMPERATURE || '0.7'),
        }
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw error;
    }
  }

  async processTextChunk(chunk, isFirstChunk = false) {
    await this.initialize();
    
    let prompt = LATEX_CONVERSION_PROMPT + chunk;
    
    // For subsequent chunks, just add continuation instruction
    if (!isFirstChunk) {
      prompt = `${LATEX_CONVERSION_PROMPT}

CONTINUATION CHUNK: This is a continuation of content. Convert this additional text to LaTeX format and it will be appended to the previous content.

${chunk}`;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error processing text chunk:', error);
      throw error;
    }
  }

  async convertToAcademicPaper(text, onProgress, onPartialUpdate) {
    if (!text || !text.trim()) {
      return '';
    }

    try {
      const chunks = this.chunker.chunkText(text);
      
      // Create LaTeX document structure
      let latexDocument = this.createDocumentHeader(text);
      
      if (chunks.length === 1) {
        // Single chunk processing
        if (onProgress) onProgress(0, 1);
        const result = await this.processTextChunk(chunks[0], true);
        const cleanResult = this.cleanLatexOutput(result);
        latexDocument += cleanResult + '\n\n\\end{document}';
        if (onProgress) onProgress(1, 1);
        return latexDocument;
      }

      // Multiple chunks processing with progressive rendering
      for (let i = 0; i < chunks.length; i++) {
        if (onProgress) onProgress(i, chunks.length);
        
        const result = await this.processTextChunk(chunks[i], i === 0);
        const cleanResult = this.cleanLatexOutput(result);
        
        // Add the chunk content to document
        latexDocument += cleanResult + '\n\n';
        
        // Call partial update callback for progressive rendering
        if (onPartialUpdate) {
          const currentDocument = latexDocument + '\\end{document}';
          onPartialUpdate(currentDocument);
        }
      }
      
      // Finalize document
      latexDocument += '\\end{document}';
      if (onProgress) onProgress(chunks.length, chunks.length);
      return latexDocument;
      
    } catch (error) {
      console.error('Error converting to academic paper:', error);
      throw error;
    }
  }

  createDocumentHeader(text) {
    // Generate a simple title from the first line or paragraph
    const firstLine = text.split('\n')[0].trim();
    const title = firstLine.length < 100 ? firstLine : 'Converted Document';
    
    return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{${title}}
\\author{Author}
\\date{\\today}

\\begin{document}
\\maketitle

`;
  }

  cleanLatexOutput(latexText) {
    // Clean and standardize LaTeX output
    return latexText
      .replace(/```latex/g, '')
      .replace(/```/g, '')
      .replace(/\\documentclass{.*}/g, '')
      .replace(/\\usepackage{.*}/g, '')
      .replace(/\\begin{document}/g, '')
      .replace(/\\end{document}/g, '')
      .replace(/\\title{.*}/g, '')
      .replace(/\\author{.*}/g, '')
      .replace(/\\date{.*}/g, '')
      .replace(/\\maketitle/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService; 