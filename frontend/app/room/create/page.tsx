'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';

export default function CreateRoomPage() {
  const router = useRouter();
  const { playerName, setIsOwner } = useGameStore();

  useEffect(() => {
    if (!playerName) {
      router.push('/');
      return;
    }
    // Mark as owner and navigate to a special "new" room slug
    // The actual CREATE_ROOM message is sent from the room page once WS is ready
    setIsOwner(true);
    router.push('/room/new');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pastel-panel p-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl mb-4"
        >
          🎨
        </motion.div>
        <h2 className="text-xl font-bold text-pastel-purple-deep">
          Setting up your room...
        </h2>
      </motion.div>
    </div>
  );
}
