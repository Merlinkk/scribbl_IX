'use client';

import { motion } from 'framer-motion';
import NameInput from '@/components/home/NameInput';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-32 h-32 bg-pastel-pink/30 rounded-full blur-xl"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-pastel-blue/30 rounded-full blur-xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-pastel-yellow/30 rounded-full blur-xl"
      />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-4xl flex flex-col items-center"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-black text-white drop-shadow-[4px_4px_0_rgba(177,156,217,1)] mb-4 tracking-tight"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          Scrrbl<span className="text-pastel-pink-dark">IX</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-pastel-purple-deep font-bold mb-12 text-center max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Draw, guess, and have fun with friends!
        </motion.p>

        <div className="pastel-panel p-8 md:p-12 w-full max-w-md flex flex-col items-center gap-8 relative">
          {/* Cute corner decorations */}
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-pastel-yellow rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl animate-bounce-slow">✏️</div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pastel-green rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🎨</div>
          
          <NameInput />
          
        </div>

        {/* Footer links */}
        <motion.div 
          className="mt-16 flex gap-8 text-pastel-purple-deep font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a href="#" className="hover:text-pastel-pink-dark transition-colors">How to Play</a>
          <a href="#" className="hover:text-pastel-pink-dark transition-colors">About</a>
          <a href="#" className="hover:text-pastel-pink-dark transition-colors">Github</a>
        </motion.div>
      </motion.div>
    </div>
  );
}
