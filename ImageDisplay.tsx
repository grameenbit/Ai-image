import React from 'react';
import DownloadIcon from './icons/DownloadIcon';
import EditIcon from './icons/EditIcon';
import UpscaleIcon from './icons/UpscaleIcon';

interface ImageDisplayProps {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onUseAsSource: (imageData: string) => void;
  onUpscale: (imageData: string) => void;
  loadingText: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ generatedImage, isLoading, error, onUseAsSource, onUpscale, loadingText }) => {

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = `nano-banana-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative">
      {/* Render the image if it exists, apply styles during loading */ }
      {generatedImage && !error && (
        <img
          src={`data:image/png;base64,${generatedImage}`}
          alt="Generated"
          className={`object-contain w-full h-full transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'animate-fade-in'}`}
        />
      )}

      {/* Loading Indicator Overlay */ }
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-black/30 backdrop-blur-sm">
          <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold">{loadingText}...</p>
        </div>
      )}

      {/* Error Display */ }
      {error && !isLoading && (
         <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
           <p className="mt-4 font-semibold text-red-400">An Error Occurred</p>
           <p className="text-sm text-gray-400 mt-1">{error}</p>
         </div>
      )}

      {/* Action Buttons: only show when not loading and an image is present */ }
      {generatedImage && !isLoading && !error && (
        <div className="absolute bottom-3 right-3 flex flex-col sm:flex-row gap-2">
           <button 
              onClick={() => onUpscale(generatedImage)}
              className="flex items-center justify-center gap-2 bg-gray-800/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors backdrop-blur-sm"
              title="Upscale image"
            >
              <UpscaleIcon />
              <span className="hidden sm:inline">Upscale</span>
            </button>
            <button 
              onClick={() => onUseAsSource(generatedImage)}
              className="flex items-center justify-center gap-2 bg-gray-800/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors backdrop-blur-sm"
              title="Edit this image"
            >
              <EditIcon />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-gray-800/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors backdrop-blur-sm"
              title="Download image"
            >
              <DownloadIcon />
               <span className="hidden sm:inline">Download</span>
            </button>
          </div>
      )}
      
      {!isLoading && !error && !generatedImage && (
        <div className="text-center text-gray-500 p-8">
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Your Creation Awaits</h2>
            <p>Your generated image will appear here.</p>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ImageDisplay;