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
      <rect x="6" y="12" width="16" height="8" fill="#8B6E47" />
      
      {/* Neck */}
      <rect x="18" y="8" width="8" height="8" fill="#8B6E47" />
      
      {/* Head */}
      <rect x="22" y="4" width="8" height="8" fill="#8B6E47" />
      
      {/* Eye */}
      <rect x="26" y="6" width="2" height="2" fill="#000" />
      
      {/* Legs */}
      <rect x="8" y="20" width="4" height="4" fill="#8B6E47" />
      <rect x="16" y="20" width="4" height="4" fill="#8B6E47" />
      
      {/* Tail */}
      <rect x="2" y="14" width="4" height="4" fill="#8B6E47" />
      <rect x="0" y="16" width="2" height="2" fill="#8B6E47" />
      
      {/* Mouth animation when eating */}
      {isEating && (
        <rect x="26" y="10" width="4" height="2" fill="#6B5537">
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