'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import PlayerList from './PlayerList';
import Chat from './Chat';
import Canvas from './Canvas';
import WordSelection from './WordSelection';
import RoundEnd from './RoundEnd';
import GameOver from './GameOver';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENTS } from '@/lib/constants';

export default function Game() {
  const { phase, timeLeft, currentRound, totalRounds, wordHint, isDrawer, currentDrawerId, players } = useGameStore();
  const { sendMessage } = useWebSocket();

  // Find current drawer name
  const currentDrawer = players.find(p => p.id === currentDrawerId);

  return (
    <div className="flex h-screen w-full bg-pastel-purple/10 p-4 gap-4 overflow-hidden">
      {/* Left Sidebar - Players */}
      <div className="w-64 flex-shrink-0 hidden md:block">
        <PlayerList />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header - Timer & Word */}
        <div className="h-16 flex items-center justify-between px-6 py-2 bg-white/80 rounded-xl shadow-sm border-2 border-pastel-purple">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center bg-pastel-yellow rounded-full border-4 border-white shadow-md">
              <span className="font-bold text-lg text-yellow-800">{timeLeft}</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={timeLeft <= 10 ? '#EF4444' : '#FCD34D'}
                  strokeWidth="4"
                  strokeDasharray="126"
                  strokeDashoffset={126 - (126 * timeLeft) / 60}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Round {currentRound} of {totalRounds}</span>
              {phase === 'drawing' && isDrawer ? (
                <span className="text-lg font-bold text-pastel-purple-deep">Draw: {useGameStore.getState().selectedWord}</span>
              ) : (
                <div className="flex gap-2 font-mono text-2xl tracking-widest font-bold text-gray-800">
                  {wordHint.split('').map((char, i) => (
                    <span key={i} className={char === ' ' ? 'w-4' : 'border-b-2 border-gray-400 min-w-[20px] text-center'}>
                      {char === '_' ? '\u00A0' : char}
                    </span>
                  ))}
                  <sup className="text-xs text-gray-400 font-sans ml-1">{wordHint.replace(/ /g, '').length}</sup>
                </div>
              )}
            </div>
          </div>
          
          <div className="hidden sm:block">
            {phase === 'choosing' && (
              <span className="text-pastel-purple-deep font-bold animate-pulse">
                {currentDrawer?.name} is choosing a word...
              </span>
            )}
            {phase === 'drawing' && (
              <span className="text-pastel-green-dark font-bold">
                {currentDrawer?.name} is drawing!
              </span>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 relative bg-white rounded-xl shadow-lg border-4 border-pastel-purple-dark overflow-hidden">
          <Canvas />
          
          <AnimatePresence>
            {phase === 'choosing' && isDrawer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <WordSelection />
              </motion.div>
            )}

            {phase === 'roundEnd' && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md"
              >
                <RoundEnd />
              </motion.div>
            )}

            {phase === 'gameOver' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-pastel-purple/90 backdrop-blur-lg"
              >
                <GameOver />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar - Chat */}
      <div className="w-80 flex-shrink-0 hidden lg:block h-full">
        <Chat />
      </div>

      {/* Mobile Chat Overlay Button - visible only on small screens */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <button 
          className="w-12 h-12 bg-pastel-purple text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
          onClick={() => {/* Toggle mobile chat */}}
        >
          💬
        </button>
      </div>
    </div>
  );
}
