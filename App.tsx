import React, { useState, useCallback, useRef } from 'react';
import { Mode, SourceImage } from './types';
import { generateImage, upscaleImage } from './services/geminiService';
import ModeSelector from './components/ModeSelector';
import ImageUploader from './components/ImageUploader';
import DrawingCanvas from './components/DrawingCanvas';
import ImageDisplay from './components/ImageDisplay';
import History from './components/History';
import StyleSelector from './components/StyleSelector';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('text');
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>('Default');
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Generating');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const canvasRef = useRef<any>(null);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Reset inputs when changing mode for a cleaner UX
    if (newMode === 'text') {
      setSourceImage(null);
    }
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
    if(canvasRef.current?.clearCanvas && newMode === 'draw') {
      canvasRef.current.clearCanvas();
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt && !sourceImage) {
      setError('Please provide a prompt, upload an image, or draw something.');
      return;
    }

    setLoadingText('Generating');
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage(prompt, sourceImage, style);
      setGeneratedImage(result);
      setHistory(prev => [result, ...prev].slice(0, 10)); // Add to history, keep last 10
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, sourceImage, style]);
  
  const handleUpscale = useCallback(async (imageData: string) => {
    setIsLoading(true);
    setLoadingText('Upscaling');
    setError(null);

    try {
        const sourceForUpscale: SourceImage = { data: imageData, mimeType: 'image/png' };
        const result = await upscaleImage(sourceForUpscale);
        setGeneratedImage(result);
        setHistory(prev => [result, ...prev].slice(0, 10));
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during upscaling.');
    } finally {
        setIsLoading(false);
    }
  }, []);

  // FIX: Wrapped function passed as a prop in useCallback to memoize it.
  const handleUseAsSource = useCallback((imageData: string) => {
    setSourceImage({ data: imageData, mimeType: 'image/png' });
    setMode('image');
    setGeneratedImage(null); // Clear the generated image display to avoid confusion
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // FIX: Wrapped function passed as a prop in useCallback to memoize it.
  const handleViewHistoryImage = useCallback((imageData: string) => {
    setGeneratedImage(imageData);
  }, []);

  const getActiveSourceImage = () => {
    return sourceImage ? `data:${sourceImage.mimeType};base64,${sourceImage.data}` : null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Nano Banana Image Studio
          </h1>
          <p className="text-gray-400 mt-2">Create, edit, and transform images with the power of Gemini.</p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Inputs & Controls */}
          <div className="lg:w-1/2 flex flex-col gap-6 p-6 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700">
            <ModeSelector currentMode={mode} onModeChange={handleModeChange} />

            <div className="flex-grow flex flex-col gap-4">
               <StyleSelector currentStyle={style} onStyleChange={setStyle} />
              {mode === 'image' && (
                <ImageUploader sourceImage={getActiveSourceImage()} onImageUpload={setSourceImage} />
              )}
              {mode === 'draw' && (
                <DrawingCanvas ref={canvasRef} onDrawingChange={setSourceImage} />
              )}
              {mode === 'text' && (
                 <div className="flex items-center justify-center h-full bg-gray-900/40 rounded-lg border-2 border-dashed border-gray-600">
                    <p className="text-gray-500">Write a prompt to begin</p>
                 </div>
              )}
               <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'text' ? "e.g., A futuristic city skyline at sunset..." :
                  mode === 'image' ? "e.g., Add a unicorn in the background..." :
                  "Describe what your drawing should become..."
                }
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none h-28"
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingText}...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="lg:w-1/2 p-2 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 flex flex-col">
             <ImageDisplay generatedImage={generatedImage} isLoading={isLoading} error={error} onUseAsSource={handleUseAsSource} onUpscale={handleUpscale} loadingText={loadingText} />
             {history.length > 0 && (
                <History history={history} onView={handleViewHistoryImage} onUseAsSource={handleUseAsSource} />
             )}
          </div>
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Nano Banana Image Studio. All rights reserved.</p>
            <p className="mt-2">
                <a href="/about.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300 transition-colors">About</a>
                <span className="mx-2">|</span>
                <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300 transition-colors">Terms of Service</a>
                <span className="mx-2">|</span>
                <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300 transition-colors">Privacy Policy</a>
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;