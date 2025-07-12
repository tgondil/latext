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

  async processTextChunk(chunk, isFirstChunk = false, previousContext = '') {
    await this.initialize();
    
    let prompt = ACADEMIC_PAPER_PROMPT + chunk;
    
    // Add context for subsequent chunks
    if (!isFirstChunk && previousContext) {
      prompt = `
${ACADEMIC_PAPER_PROMPT}

CONTEXT FROM PREVIOUS SECTIONS:
${previousContext}

CONTINUE THE ACADEMIC PAPER WITH THIS ADDITIONAL CONTENT:
${chunk}

Please continue the paper by extending the existing sections or adding new ones as appropriate. Maintain consistency with the previous content.
`;
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

  async convertToAcademicPaper(text, onProgress) {
    if (!text || !text.trim()) {
      return '';
    }

    try {
      const chunks = this.chunker.chunkText(text);
      
      if (chunks.length === 1) {
        // Single chunk processing
        if (onProgress) onProgress(0, 1);
        const result = await this.processTextChunk(chunks[0], true);
        if (onProgress) onProgress(1, 1);
        return this.cleanLatexOutput(result);
      }

      // Multiple chunks processing with chain of thought
      let finalPaper = '';
      let previousContext = '';
      
      for (let i = 0; i < chunks.length; i++) {
        if (onProgress) onProgress(i, chunks.length);
        
        const result = await this.processTextChunk(
          chunks[i], 
          i === 0, 
          previousContext
        );
        
        if (i === 0) {
          finalPaper = result;
          previousContext = this.extractContext(result);
        } else {
          // Merge subsequent chunks intelligently
          const mergedPaper = this.mergeChunks(finalPaper, result);
          finalPaper = mergedPaper;
          previousContext = this.extractContext(result);
        }
      }
      
      if (onProgress) onProgress(chunks.length, chunks.length);
      return this.cleanLatexOutput(finalPaper);
      
    } catch (error) {
      console.error('Error converting to academic paper:', error);
      throw error;
    }
  }

  extractContext(latexText) {
    // Extract key information for context in next chunk
    const lines = latexText.split('\n');
    const contextLines = [];
    
    for (const line of lines) {
      if (line.includes('\\title{') || 
          line.includes('\\section{') || 
          line.includes('\\subsection{')) {
        contextLines.push(line);
      }
    }
    
    return contextLines.join('\n');
  }

  mergeChunks(basePaper, additionalContent) {
    // Intelligent merging of LaTeX chunks
    const baseLines = basePaper.split('\n');
    const additionalLines = additionalContent.split('\n');
    
    // Find the end of document in base paper
    const endDocIndex = baseLines.findIndex(line => line.includes('\\end{document}'));
    
    // Extract new content (skip document preamble)
    const newContent = additionalLines.filter(line => 
      !line.includes('\\documentclass') &&
      !line.includes('\\usepackage') &&
      !line.includes('\\title{') &&
      !line.includes('\\author{') &&
      !line.includes('\\date{') &&
      !line.includes('\\begin{document}') &&
      !line.includes('\\maketitle') &&
      !line.includes('\\end{document}')
    ).join('\n');
    
    // Insert new content before \end{document}
    if (endDocIndex !== -1) {
      baseLines.splice(endDocIndex, 0, newContent);
    } else {
      baseLines.push(newContent);
    }
    
    return baseLines.join('\n');
  }

  cleanLatexOutput(latexText) {
    // Clean and standardize LaTeX output
    return latexText
      .replace(/```latex/g, '')
      .replace(/```/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService; 