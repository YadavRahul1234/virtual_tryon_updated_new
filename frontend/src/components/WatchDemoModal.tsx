import React from 'react';
import { X, PlayCircle } from 'lucide-react';

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchDemoModal: React.FC<WatchDemoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-black rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-800">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="aspect-video w-full relative">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/6m6W8N_4oDA?autoplay=1&mute=0"
            title="Pose2Fit Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        <div className="p-6 bg-gray-900 flex items-center justify-between border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-600 rounded-lg">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Pose2Fit Showcase</h3>
              <p className="text-sm text-gray-400">See how our AI analyzes measurements and simulates try-ons in real-time.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
