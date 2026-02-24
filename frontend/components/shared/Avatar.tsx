'use client';

import { Facehash } from 'facehash';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
  showBlink?: boolean;
}

export default function Avatar({ name, size = 64, className = '', showBlink = false }: AvatarProps) {
  return (
    <div 
      className={`rounded-xl overflow-hidden bg-white border-2 border-pastel-purple-dark ${className}`}
      style={{ width: size, height: size }}
    >
      <Facehash 
        name={name || 'guest'} 
        size={size}
        variant="gradient"
        intensity3d="subtle"
        enableBlink={showBlink}
      />
    </div>
  );
}
