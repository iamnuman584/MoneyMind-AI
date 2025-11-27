import React from 'react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, transcript }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card-bg dark:bg-dark-card-bg rounded-2xl shadow-xl w-full max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-text-primary dark:text-dark-text-primary">Listening...</h2>
        <div className="my-8">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-24 h-24 bg-primary rounded-full text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
            </div>
        </div>
        <p className="text-text-secondary dark:text-dark-text-secondary min-h-[2.5em] text-lg">{transcript || 'Say something like "Add ₹500 for pizza"'}</p>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VoiceInputModal;
