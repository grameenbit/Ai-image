import React, { useRef } from 'react';
import { SourceImage } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface ImageUploaderProps {
  onImageUpload: (image: SourceImage | null) => void;
  sourceImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, sourceImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await fileToBase64(file);
        onImageUpload({ data, mimeType: file.type });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        onImageUpload(null);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <div 
          onClick={handleUploadClick}
          className="relative w-full aspect-video bg-gray-900/40 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800/60 transition-colors duration-300 overflow-hidden"
        >
          {sourceImage ? (
            <img src={sourceImage} alt="Source" className="object-contain w-full h-full" />
          ) : (
            <div className="text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="mt-2">Click to upload an image</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          )}
           <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
        </div>
        <p className="text-xs text-center text-gray-500">
            Upload an image and write a prompt to generate a new version.
        </p>
    </div>
  );
};

export default ImageUploader;