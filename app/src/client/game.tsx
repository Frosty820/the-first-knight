import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

export const App = () => {
  const [vote, setVote] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center min-h-screen gap-4 p-6 bg-white dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Day 1 — A knights life is in your hands 
      </p>

      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        The Annoying Squire
      </h1>

      <p className="text-base text-center text-gray-700 dark:text-gray-300 max-w-md">
        A young squire lies bleeding by the road, clutching a sealed letter.
        "Please... this must reach the capital. I can pay nothing."
      </p>

      {vote === null ? (
        <div className="flex flex-col gap-3 w-full max-w-md">
          <button
            className="bg-[#d93900] text-white rounded-lg px-4 py-3 cursor-pointer hover:bg-[#c23300]"
            onClick={() => setVote('Carry the letter')}
          >
            Carry the letter (−2 HP)
          </button>
          <button
            className="bg-[#d93900] text-white rounded-lg px-4 py-3 cursor-pointer hover:bg-[#c23300]"
            onClick={() => setVote('Sell the letter')}
          >
            Sell the letter (+15g)
          </button>
          <button
            className="bg-[#d93900] text-white rounded-lg px-4 py-3 cursor-pointer hover:bg-[#c23300]"
            onClick={() => setVote('Pretend he doesnt exist ')}
          >
            Pretend he doesn't exist (−1 Honour)
          </button>
        </div>
      ) : (
        <p className="text-lg text-center text-gray-900 dark:text-white">
          ⚔️ You voted: <b>{vote}</b>. The realm decides at midnight.
        </p>
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);