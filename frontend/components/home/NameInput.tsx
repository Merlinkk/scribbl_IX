'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/shared/Avatar';
import { motion } from 'framer-motion';

export default function NameInput() {
  const [name, setName] = useState('');
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const router = useRouter();

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    setPlayerName(name);
    // In a real app, we'd call the API to create a room here
    // For now, we'll simulate it by generating a random room ID
    // or letting the lobby component handle the actual creation via WebSocket
    router.push('/room/create'); 
  };

  const handleJoinRoom = () => {
    if (!name.trim()) return;
    setPlayerName(name);
    // Open a dialog to enter room code
    // For now just redirect to a join page
    router.push('/room/join');
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="relative group">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Avatar 
            name={name} 
            size={128} 
            className="border-4 border-pastel-purple-dark shadow-lg group-hover:scale-105 transition-transform duration-300"
            showBlink={true}
          />
        </motion.div>
        <div className="absolute -bottom-2 -right-2 bg-pastel-yellow px-3 py-1 rounded-full text-xs font-bold border-2 border-pastel-yellow-dark transform rotate-12">
          {name || 'Guest'}
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 15))}
            placeholder="Enter your name..."
            className="w-full px-6 py-4 rounded-xl border-4 border-pastel-purple bg-white/80 text-lg font-bold text-center focus:outline-none focus:border-pastel-purple-deep focus:bg-white transition-all placeholder:text-pastel-purple"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateRoom}
            disabled={!name.trim()}
            className="pastel-button btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Room
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinRoom}
            disabled={!name.trim()}
            className="pastel-button btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Room
          </motion.button>
        </div>
      </div>
    </div>
  );
}
