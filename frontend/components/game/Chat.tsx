'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENTS } from '@/lib/constants';

export default function Chat() {
  const [text, setText] = useState('');
  const { messages, phase } = useGameStore();
  const { sendMessage } = useWebSocket();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (phase === 'drawing') {
      sendMessage(EVENTS.GUESS, { text });
    } else {
      // Just chat
      // sendMessage(EVENTS.CHAT, { text }); // Backend might handle chat separately or same
      // For now, treat everything as guess/chat based on backend logic
      sendMessage(EVENTS.GUESS, { text });
    }
    setText('');
  };

  return (
    <div className="pastel-panel h-full flex flex-col overflow-hidden">
      <div className="p-3 bg-pastel-purple/20 border-b-2 border-pastel-purple">
        <h3 className="font-bold text-pastel-purple-deep">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-white/50">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm p-2 rounded-lg break-words shadow-sm border
                ${msg.type === 'system' ? 'bg-pastel-blue/20 text-blue-800 border-pastel-blue font-semibold text-center' : ''}
                ${msg.type === 'correct' ? 'bg-pastel-green/20 text-green-800 border-pastel-green font-bold text-center' : ''}
                ${msg.type === 'join' ? 'bg-pastel-yellow/20 text-yellow-800 border-pastel-yellow text-center' : ''}
                ${msg.type === 'leave' ? 'bg-pastel-pink/20 text-pink-800 border-pastel-pink text-center' : ''}
                ${msg.type === 'chat' ? 'bg-white border-gray-100' : ''}
              `}
            >
              {msg.type === 'chat' && (
                <span className="font-bold text-gray-700 mr-1">
                  {msg.playerName}:
                </span>
              )}
              <span>{msg.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white/80 border-t-2 border-pastel-purple">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={phase === 'drawing' ? "Type your guess here..." : "Chat here..."}
          className="w-full px-4 py-2 rounded-full border-2 border-pastel-purple focus:outline-none focus:border-pastel-purple-deep focus:ring-2 focus:ring-pastel-purple/20 transition-all text-sm"
          maxLength={100}
        />
      </form>
    </div>
  );
}
