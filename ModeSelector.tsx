import React from 'react';
import { Mode } from '../types';
import TextIcon from './icons/TextIcon';
import ImageIcon from './icons/ImageIcon';
import DrawIcon from './icons/DrawIcon';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const modes: { id: Mode; label: string; icon: React.ReactElement }[] = [
    { id: 'text', label: 'Text to Image', icon: <TextIcon /> },
    { id: 'image', label: 'Image to Image', icon: <ImageIcon /> },
    { id: 'draw', label: 'Draw to Image', icon: <DrawIcon /> },
  ];

  return (
    <div className="flex w-full bg-gray-900 p-1 rounded-lg">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex-1 py-2 px-2 sm:px-4 text-sm sm:text-base font-semibold rounded-md flex items-center justify-center gap-2 transition-colors duration-300
            ${
              currentMode === mode.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;