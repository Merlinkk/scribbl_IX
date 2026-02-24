'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import Avatar from '@/components/shared/Avatar';
import { ArrowLeft } from 'lucide-react';

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();
  const { playerName } = useGameStore();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    // Strip full URL if pasted (e.g. http://localhost:3000/room/66a0cedb -> 66a0cedb)
    const code = roomCode.trim().replace(/.*\/room\//, '');
    router.push(`/room/${code}`);
  };

  // Redirect if no player name
  if (!playerName) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pastel-panel p-8 w-full max-w-md"
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-pastel-purple-deep hover:text-pastel-purple mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex flex-col items-center mb-6">
          <Avatar name={playerName} size={80} showBlink />
          <p className="mt-2 font-bold text-gray-700">{playerName}</p>
        </div>

        <h1 className="text-2xl font-black text-center text-pastel-purple-deep mb-6">
          Join a Room
        </h1>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.trim())}
              placeholder="e.g. 66a0cedb"
              className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border-4 border-pastel-purple bg-white focus:outline-none focus:border-pastel-purple-deep transition-colors"
              maxLength={36}
              autoFocus
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!roomCode.trim()}
            className="w-full pastel-button btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Room
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
