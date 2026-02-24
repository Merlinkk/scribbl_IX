'use client';

import { useGameStore } from '@/stores/gameStore';
import Avatar from '@/components/shared/Avatar';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function GameOver() {
  const { players, resetGame } = useGameStore();
  const router = useRouter();

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  // Confetti effect on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#DCD0FF', '#FFB7B2', '#E2F0CB', '#B5EAD7']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#DCD0FF', '#FFB7B2', '#E2F0CB', '#B5EAD7']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    router.push('/');
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      className="pastel-panel p-8 max-w-lg w-full mx-4 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-8xl mb-4"
      >
        🏆
      </motion.div>

      <h1 className="text-3xl font-black text-pastel-purple-deep mb-2">Game Over!</h1>
      
      {winner && (
        <div className="my-6">
          <p className="text-gray-600 font-semibold mb-3">Winner</p>
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <Avatar name={winner.name} size={96} showBlink />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -top-4 -right-4 text-4xl"
              >
                👑
              </motion.div>
            </div>
            <h2 className="text-2xl font-black text-pastel-purple-deep">{winner.name}</h2>
            <p className="text-xl font-bold text-pastel-pink-dark">{winner.score} points</p>
          </motion.div>
        </div>
      )}

      <div className="space-y-2 mb-8 max-h-48 overflow-y-auto">
        {sortedPlayers.slice(1).map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-3 p-2 bg-white/50 rounded-lg"
          >
            <span className="font-bold text-gray-500 w-6">#{index + 2}</span>
            <Avatar name={player.name} size={32} />
            <span className="flex-1 font-semibold truncate text-left">{player.name}</span>
            <span className="font-bold text-pastel-purple">{player.score} pts</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlayAgain}
        className="pastel-button btn-primary text-lg px-8 py-3"
      >
        Play Again
      </motion.button>
    </motion.div>
  );
}
