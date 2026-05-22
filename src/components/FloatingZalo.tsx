import React from 'react';

const FloatingZalo: React.FC = () => {
  return (
    <a
      href="https://zalo.me/0566665511"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#0068FF] rounded-full shadow-[0_4px_15px_rgba(0,104,255,0.4)] hover:bg-[#0055D0] hover:scale-110 transition-all duration-300 group"
      aria-label="Chat Zalo"
    >
      <svg viewBox="0 0 460.1 436.6" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <path d="M82.6 380.9c-1.8-.8-3.1-1.7-1-3.5 1.3-1.1 2.7-1.9 4.1-2.8 13.1-8.5 25.4-17.8 33.5-31.5 6.8-11.4 5.7-18.1-2.8-26.5C85 285.7 66.8 247.1 66.8 200.7c0-110.8 89.8-200.7 200.7-200.7s200.7 89.8 200.7 200.7-89.8 200.7-200.7 200.7c-21.2 0-41.7-3.3-60.8-9.4-15.6-5-31.8-6.1-47.5-1.9-19.4 5.2-38.3 11.5-57.2 18-5.3 1.8-9.7 1.8-19.4-7.2zm311.6-180.2c-15.4 0-23.7 7.7-23.7 21.8 0 13.5 8.1 21.3 23.1 21.3h41.4c3.4 0 6.6.6 9.6 1.7 8.3 3.1 13.3 9.7 14 18.7.6 8.5-3.3 15.6-10.7 19.8-3.7 2.1-8.1 3.2-12.7 3.2H320v-20.2c0-3.3-1-6-3-7.9-2-2-4.7-3.1-8-3.1h-26c-6.2 0-9.4 3.1-9.4 9.4v51.1c0 6.3 3.1 9.4 9.4 9.4h83.3c15.2 0 29.5-3.5 42-10 16.9-8.7 28.5-22.3 33.6-40.8 5.7-20.9 2-40.1-11.8-56-11.9-13.8-28.7-20.8-49.1-20.8h-46.7c-5 0-9.2-3.1-9.2-6.6 0-3.1 3.7-6 8.2-6h50.7c3.7 0 6.6-.7 8.7-2.1 6.8-4.7 9.8-11.4 8.7-19.8-1.1-7.8-5.5-13.4-12.8-16.1-2.9-1.1-6.1-1.6-9.6-1.6h-34.9zm-215.1 0h-72.3c-6.1 0-9.3 3.2-9.3 9.4v20.4c0 6.2 3.2 9.4 9.3 9.4h22v26.2c0 23.3-13.2 40.5-35 45.4-4 .9-7.5 4.3-8.8 8.4-1.2 3.8-.4 7.9 2.2 10.9 2.4 2.8 5.9 4.5 9.7 4.5 19.7 0 37.8-8.9 50.1-24.8 11.5-14.8 17.5-33.1 17.5-52.6v-27.4h14.6c6.1 0 9.3-3.2 9.3-9.4v-20.4c0-6.2-3.2-9.4-9.3-9.4z" fill="#FFFFFF"/>
      </svg>
      <div className="absolute inset-0 border-2 border-[#0068FF] rounded-full animate-ping opacity-75"></div>
      
      <div className="absolute right-full mr-4 bg-[#0068FF] text-white px-3 py-1 rounded-md text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat Zalo
      </div>
    </a>
  );
};

export default FloatingZalo;
