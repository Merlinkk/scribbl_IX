'use client';

import { useGameStore } from '@/stores/gameStore';
import Avatar from '@/components/shared/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerList() {
  const { players, currentDrawerId, playerId } = useGameStore();

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="pastel-panel p-4 flex flex-col gap-3 h-full overflow-hidden">
      <h3 className="text-xl font-bold text-pastel-purple-deep text-center mb-2">Players</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              layout
              className={`
                relative flex items-center gap-3 p-2 rounded-xl border-2 transition-colors
                ${player.id === playerId ? 'bg-pastel-yellow/30 border-pastel-yellow-dark' : 'bg-white/50 border-transparent'}
                ${player.hasGuessed ? 'bg-pastel-green/30 border-pastel-green-dark' : ''}
              `}
            >
              <div className="font-bold text-pastel-purple-deep text-lg w-6 text-center">
                #{index + 1}
              </div>
              
              <div className="relative">
                <Avatar name={player.name} size={48} showBlink={player.id === playerId} />
                {player.isDrawer && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 text-xl bg-white rounded-full p-1 shadow-sm border border-pastel-purple-dark"
                  >
                    ✏️
                  </motion.div>
                )}
                {player.hasGuessed && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 text-xl bg-white rounded-full p-1 shadow-sm border border-pastel-green-dark"
                  >
                    ✅
                  </motion.div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 truncate">
                  {player.name}
                  {player.id === playerId && <span className="text-xs text-pastel-purple ml-1">(You)</span>}
                </div>
                <div className="text-sm text-pastel-purple-deep font-semibold">
                  {player.score} pts
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
