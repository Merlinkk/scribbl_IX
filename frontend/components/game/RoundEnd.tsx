'use client';

import { useGameStore } from '@/stores/gameStore';
import Avatar from '@/components/shared/Avatar';
import { motion } from 'framer-motion';

export default function RoundEnd() {
  const { players, currentRound, totalRounds } = useGameStore();
  
  // Get the word from the last system message
  const lastSystemMsg = useGameStore.getState().messages.find(m => m.type === 'system' && m.text.includes('The word was'));
  const word = lastSystemMsg?.text.match(/"([^"]+)"/)?.[1] || '???';

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="pastel-panel p-8 max-w-md w-full mx-4"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-6xl mb-4"
        >
          🎨
        </motion.div>
        <h2 className="text-xl font-bold text-gray-600">The word was</h2>
        <motion.h1 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-4xl font-black text-pastel-purple-deep mt-2"
        >
          {word}
        </motion.h1>
      </div>

      <div className="space-y-3 mb-6">
        {sortedPlayers.slice(0, 5).map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              index === 0 ? 'bg-pastel-yellow/50 border-2 border-pastel-yellow-dark' : 'bg-white/50'
            }`}
          >
            <span className="font-bold text-lg w-6 text-center text-pastel-purple-deep">
              {index === 0 ? '👑' : `#${index + 1}`}
            </span>
            <Avatar name={player.name} size={40} />
            <span className="flex-1 font-bold truncate">{player.name}</span>
            <span className="font-bold text-pastel-purple-deep">{player.score} pts</span>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-gray-500">
        <p className="font-semibold">Round {currentRound} of {totalRounds}</p>
        <p className="text-sm mt-1">Next round starting soon...</p>
      </div>
    </motion.div>
  );
}
