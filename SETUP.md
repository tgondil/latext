# LaText Setup Guide

## Gemini AI Integration Setup

To enable AI-powered academic paper generation, you'll need to configure the Gemini API.

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Create Environment File

Create a `.env` file in the root directory of your project:

```bash
# Create .env file
touch .env
```

Add the following to your `.env` file:

```env
# Gemini API Configuration
REACT_APP_GEMINI_API_KEY=your_api_key_here

# Optional: Model configuration (defaults shown)
REACT_APP_GEMINI_MODEL=gemini-1.5-flash
REACT_APP_MAX_TOKENS=8192
REACT_APP_TEMPERATURE=0.7
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

## Features with AI Enhancement

When AI Enhancement is enabled, LaText will:

- ✅ **Chain of Thought Processing**: Analyze your text structure and content
- ✅ **Professional Academic Formatting**: Apply proper academic writing conventions
- ✅ **Intelligent Sectioning**: Create logical sections (Introduction, Methodology, Results, Conclusion)
- ✅ **Abstract Generation**: Create comprehensive abstracts from your content
- ✅ **Citation Formatting**: Proper LaTeX citation formatting
- ✅ **Large Document Support**: Process large texts in chunks with context preservation

## Troubleshooting

### API Key Issues
- Make sure your API key is valid and has proper permissions
- Check that the `.env` file is in the project root
- Restart the development server after adding the API key

### Large Document Processing
- For very large documents, the AI will process them in chunks
- Progress will be shown during processing
- Context is preserved between chunks for coherent output

### Fallback Mode
- If AI processing fails, the app automatically falls back to basic conversion
- Your content will still be converted to LaTeX format

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and don't share it publicly
- The `.env` file is already included in `.gitignore`

## Rate Limits

- Gemini API has rate limits - processing very large documents may take some time
- The app includes debouncing to prevent excessive API calls
- Consider the Google AI Studio usage quotas for your API key 