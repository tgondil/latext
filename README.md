# LaText - Academic Paper Generator

LaText is a modern web application that converts plain text into beautifully formatted academic papers using LaTeX. Powered by Google's Gemini AI with advanced chain-of-thought processing, it transforms your text into professional academic documents with proper sectioning, formatting, and styling.

## Features

### 🤖 AI-Powered Enhancement
- **Gemini AI Integration**: Powered by Google's advanced language model
- **Chain of Thought Processing**: Intelligent analysis and structuring of your content
- **Professional Academic Formatting**: AI applies proper academic writing conventions
- **Intelligent Sectioning**: Automatically creates logical sections (Introduction, Methodology, Results, Conclusion)
- **Abstract Generation**: Creates comprehensive abstracts from your content
- **Large Document Support**: Processes large texts in chunks with context preservation

### 🎯 Core Features
- **Real-time Conversion**: Convert text to LaTeX academic format as you type
- **Dual Processing Mode**: Choose between AI enhancement or fast basic conversion
- **Professional Styling**: Beautiful academic paper layout with proper typography
- **LaTeX Preview**: See your document rendered in real-time
- **Copy to Clipboard**: Easily copy the generated LaTeX code
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Graceful fallback to basic conversion if AI processing fails

## Technology Stack

### Core Technologies
- **React 18** - Modern UI framework with hooks
- **KaTeX** - LaTeX rendering engine
- **Webpack** - Module bundler and development server
- **Babel** - JavaScript transpiler
- **CSS3** - Modern styling with flexbox and grid

### AI Integration
- **Google Generative AI** - Gemini API for intelligent text processing
- **Chain of Thought Prompting** - Advanced reasoning for academic formatting
- **Intelligent Text Chunking** - Handles large documents efficiently
- **Context Preservation** - Maintains coherence across document sections

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd latext
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up Gemini AI (for AI enhancement)**:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the project root:
     ```env
     REACT_APP_GEMINI_API_KEY=your_api_key_here
     ```
   - See [SETUP.md](SETUP.md) for detailed configuration

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run dev` - Starts development server and opens browser

## How It Works

### With AI Enhancement (Recommended)
1. **Input**: Enter your text in the left panel
2. **AI Analysis**: Gemini AI analyzes your content using chain-of-thought reasoning
3. **Academic Structuring**: AI creates proper sections, abstracts, and formatting
4. **LaTeX Generation**: Produces professional LaTeX code with academic conventions
5. **Rendering**: See your beautifully formatted academic paper in real-time
6. **Export**: Copy the generated LaTeX code to use in your LaTeX editor

### Basic Mode (Fallback)
1. **Input**: Enter your text in the left panel
2. **Processing**: Fast rule-based conversion to LaTeX format
3. **Rendering**: Basic academic paper structure with standard formatting
4. **Export**: Copy the generated LaTeX code

## Text-to-LaTeX Conversion

LaText intelligently converts your text using these rules:

- **Title**: First paragraph or sentence becomes the paper title
- **Abstract**: Generated from the first substantial paragraph
- **Sections**: Automatically creates logical sections from your content
- **Formatting**: Supports bold (*text*), italic (_text_), and lists
- **Citations**: Converts [1] style references to proper LaTeX citations

## Example

Input:
```
Machine Learning in Healthcare

This paper explores the applications of machine learning in modern healthcare systems. We examine various algorithms and their effectiveness in medical diagnosis and treatment planning.

The use of artificial intelligence in healthcare has grown significantly over the past decade. Machine learning algorithms can analyze vast amounts of medical data to identify patterns and make predictions.

Data preprocessing is crucial for successful machine learning applications. We collected patient data from multiple sources and applied various cleaning techniques.

Our results show that machine learning models can achieve high accuracy in medical diagnosis tasks. The models demonstrated particularly strong performance in image analysis and patient outcome prediction.
```

Output:
```latex
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage{cite}
\usepackage{graphicx}
\usepackage{hyperref}

\title{Machine Learning in Healthcare}
\author{Author Name}
\date{\today}

\begin{document}
\maketitle

\begin{abstract}
This paper explores the applications of machine learning in modern healthcare systems. We examine various algorithms and their effectiveness in medical diagnosis and treatment planning.
\end{abstract}

\section{Introduction}
The use of artificial intelligence in healthcare has grown significantly over the past decade. Machine learning algorithms can analyze vast amounts of medical data to identify patterns and make predictions.

\section{Methodology}
Data preprocessing is crucial for successful machine learning applications. We collected patient data from multiple sources and applied various cleaning techniques.

\section{Results}
Our results show that machine learning models can achieve high accuracy in medical diagnosis tasks. The models demonstrated particularly strong performance in image analysis and patient outcome prediction.

\end{document}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Support for mathematical equations
- [ ] Bibliography management
- [ ] Custom templates
- [ ] Export to PDF
- [ ] Collaborative editing
- [ ] LaTeX package customization

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

Built with ❤️ for the academic community 