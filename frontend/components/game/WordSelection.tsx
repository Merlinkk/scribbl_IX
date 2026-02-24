'use client';

import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { motion } from 'framer-motion';
import { EVENTS } from '@/lib/constants';

export default function WordSelection() {
  const { wordChoices, setSelectedWord, setPhase } = useGameStore();
  const { sendMessage } = useWebSocket();

  const handleSelectWord = (word: string) => {
    setSelectedWord(word);
    // Backend expects raw string: json.Unmarshal(msg.Data, &word)
    sendMessage(EVENTS.WORD_SELECTED, word);
    setPhase('drawing');
  };

  if (!wordChoices || wordChoices.length === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="pastel-panel p-8 max-w-lg w-full mx-4"
    >
      <h2 className="text-2xl font-bold text-center text-pastel-purple-deep mb-6">
        Choose a word to draw!
      </h2>
      
      <div className="flex flex-col gap-4">
        {wordChoices.map((word, index) => (
          <motion.button
            key={word}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectWord(word)}
            className="w-full py-4 px-6 text-xl font-bold rounded-xl bg-gradient-to-r from-pastel-purple to-pastel-pink text-white shadow-lg hover:shadow-xl transition-shadow border-b-4 border-purple-400"
          >
            {word}
          </motion.button>
        ))}
      </div>

      <p className="text-center text-gray-500 mt-6 text-sm">
        Choose wisely! Your friends will try to guess it.
      </p>
    </motion.div>
  );
}
