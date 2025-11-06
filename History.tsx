import React from 'react';
import EditIcon from './icons/EditIcon';

interface HistoryProps {
  history: string[];
  onView: (imageData: string) => void;
  onUseAsSource: (imageData: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, onView, onUseAsSource }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-3 px-2 text-gray-300">History</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg border border-gray-700/50">
        {history.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">Your generated images will appear here.</p>
        ) : (
          history.map((imgData, index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden cursor-pointer bg-gray-800">
              <img
                src={`data:image/png;base64,${imgData}`}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onClick={() => onView(imgData)}
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-1">
                <button
                    onClick={() => onUseAsSource(imgData)}
                    className="flex items-center justify-center w-10 h-10 bg-indigo-600/80 rounded-full hover:bg-indigo-500 transition-colors backdrop-blur-sm"
                    title="Edit this image"
                >
                    <EditIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
