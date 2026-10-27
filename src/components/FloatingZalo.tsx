import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingZalo: React.FC = () => {
  return (
    <a
      href="https://zalo.me/0566665511"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#0068FF] rounded-full shadow-[0_4px_15px_rgba(0,104,255,0.4)] hover:bg-[#0055D0] hover:scale-110 transition-all duration-300 group"
      aria-label="Chat Zalo"
    >
      <MessageCircle className="w-8 h-8 text-white" />
      <div className="absolute inset-0 border-2 border-[#0068FF] rounded-full animate-ping opacity-75"></div>
      
      <div className="absolute right-full mr-4 bg-[#0068FF] text-white px-3 py-1 rounded-md text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat Zalo
      </div>
    </a>
  );
};

export default FloatingZalo;
