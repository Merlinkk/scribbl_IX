'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { EVENTS } from '@/lib/constants';
import Lobby from '@/components/lobby/Lobby';
import Game from '@/components/game/Game';
import { motion } from 'framer-motion';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomIdParam = params.roomId as string;
  const isNew = roomIdParam === 'new';

  const { playerName, roomId, phase, connected, isOwner } = useGameStore();
  const { sendMessage } = useWebSocket();
  const sentRef = useRef(false);

  // Redirect if no player name
  useEffect(() => {
    if (!playerName) {
      if (!isNew) sessionStorage.setItem('pendingRoomId', roomIdParam);
      router.push('/');
    }
  }, [playerName, isNew, roomIdParam, router]);

  // Send CREATE_ROOM or JOIN_ROOM once connected, exactly once
  useEffect(() => {
    if (!connected || !playerName || sentRef.current) return;

    sentRef.current = true;
    if (isNew) {
      console.log('[Room] Sending CREATE_ROOM for', playerName);
      sendMessage(EVENTS.CREATE_ROOM, { playerName });
    } else if (!roomId) {
      console.log('[Room] Sending JOIN_ROOM for', roomIdParam);
      sendMessage(EVENTS.JOIN_ROOM, { roomId: roomIdParam, playerName });
    }
  }, [connected, playerName, isNew, roomIdParam, roomId, sendMessage]);

  // Show loading while connecting or waiting for room info
  if (!connected || (!roomId && !isNew)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pastel-panel p-8 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎮
          </motion.div>
          <h2 className="text-xl font-bold text-pastel-purple-deep">
            {!connected ? 'Connecting...' : isNew ? 'Creating room...' : 'Joining room...'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isNew ? '' : `Room: ${roomIdParam}`}
          </p>
        </motion.div>
      </div>
    );
  }

  if (phase === 'lobby') {
    return <Lobby />;
  }

  return <Game />;
}
