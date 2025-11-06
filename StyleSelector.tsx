import React from 'react';

interface StyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

export const STYLES = [
  'Default',
  'Photorealistic',
  'Anime',
  'Ghibli',
  'Oil Painting',
  'Cyberpunk',
  'Vintage',
  'Minimalist',
  '3D Render'
];

const StyleSelector: React.FC<StyleSelectorProps> = ({ currentStyle, onStyleChange }) => {
  return (
    <div>
      <label htmlFor="style-selector" className="block text-sm font-medium text-gray-400 mb-2">
        Artistic Style
      </label>
      <select
        id="style-selector"
        value={currentStyle}
        onChange={(e) => onStyleChange(e.target.value)}
        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
      >
        {STYLES.map(style => (
          <option key={style} value={style}>{style}</option>
        ))}
      </select>
    </div>
  );
};

export default StyleSelector;
