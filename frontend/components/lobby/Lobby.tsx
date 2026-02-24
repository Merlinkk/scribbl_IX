'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import Avatar from '@/components/shared/Avatar';
import PlayerList from '@/components/game/PlayerList';
import Chat from '@/components/game/Chat';
import { motion } from 'framer-motion';
import { EVENTS } from '@/lib/constants';
import { Copy, Check, Play } from 'lucide-react';

export default function Lobby() {
  const [copied, setCopied] = useState(false);
  const { roomId, players, isOwner, playerName } = useGameStore();
  const { sendMessage } = useWebSocket();

  const canStartGame = isOwner && players.length >= 2;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(roomId ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (canStartGame) {
      sendMessage(EVENTS.START_GAME, {});
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pastel-panel p-8 w-full max-w-xl"
        >
          {/* Room Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-pastel-purple-deep mb-2">
              Waiting Room
            </h1>
            <p className="text-gray-600">
              Invite your friends to join!
            </p>
          </div>

          {/* Room Code */}
          <div className="bg-pastel-purple/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-black tracking-widest text-pastel-purple-deep">
                {roomId}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyLink}
                className="p-2 rounded-lg bg-pastel-purple text-white hover:bg-pastel-purple-deep transition-colors"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Players Grid */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-3">
              Players ({players.length}/5)
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Avatar name={player.name} size={56} showBlink />
                  <span className="text-xs font-semibold truncate w-full text-center">
                    {player.name}
                  </span>
                </motion.div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: 5 - players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                    ?
                  </div>
                  <span className="text-xs text-gray-400">Waiting...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Game Button */}
          {isOwner ? (
            <motion.button
              whileHover={{ scale: canStartGame ? 1.02 : 1 }}
              whileTap={{ scale: canStartGame ? 0.98 : 1 }}
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                canStartGame
                  ? 'bg-gradient-to-r from-pastel-green-dark to-pastel-blue-dark text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Play size={24} />
              {canStartGame ? 'Start Game' : `Need ${2 - players.length} more player(s)`}
            </motion.button>
          ) : (
            <div className="text-center py-4 text-gray-600 font-semibold">
              Waiting for host to start the game...
            </div>
          )}
        </motion.div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-80 h-96 lg:h-auto">
        <Chat />
      </div>
    </div>
  );
}
