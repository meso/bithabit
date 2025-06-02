import React from 'react';

interface PixelDinosaurProps {
  x: number;
  y: number;
  isEating?: boolean;
}

export const PixelDinosaur: React.FC<PixelDinosaurProps> = ({ x, y, isEating = false }) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(2)`}>
      {/* Body */}
      <rect x="8" y="12" width="16" height="8" fill="#7CB342" />
      
      {/* Neck */}
      <rect x="4" y="8" width="8" height="8" fill="#7CB342" />
      
      {/* Head */}
      <rect x="0" y="4" width="8" height="8" fill="#7CB342" />
      
      {/* Eye */}
      <rect x="2" y="6" width="2" height="2" fill="#000" />
      
      {/* Legs */}
      <rect x="10" y="20" width="4" height="4" fill="#7CB342" />
      <rect x="18" y="20" width="4" height="4" fill="#7CB342" />
      
      {/* Tail */}
      <rect x="24" y="14" width="4" height="4" fill="#7CB342" />
      <rect x="28" y="16" width="2" height="2" fill="#7CB342" />
      
      {/* Mouth animation when eating */}
      {isEating && (
        <rect x="0" y="10" width="4" height="2" fill="#558B2F">
          <animate
            attributeName="width"
            values="4;6;4"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </rect>
      )}
    </g>
  );
};