import React, { useState, useRef, useEffect } from 'react';

interface ScrollColumnProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
}

function ScrollColumn({ value, onChange, max }: ScrollColumnProps) {
  const [scrollValue, setScrollValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollValue * 32;
    }
  }, [scrollValue]);

  const handleScroll = () => {
    if (containerRef.current) {
      const newValue = Math.round(containerRef.current.scrollTop / 32);
      setScrollValue(newValue);
      onChange(Math.min(newValue, max));
    }
  };

  const numbers = Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <div 
      ref={containerRef}
      className="h-[60px] w-[24px] overflow-y-scroll scrollbar-hide"
      onScroll={handleScroll}
    >
      <div className="h-[10px]" /> {/* Top spacer */}
      {numbers.map((num) => (
        <div 
          key={num} 
          className="h-[32px] flex items-center justify-center text-lg font-bold"
        >
          {num}
        </div>
      ))}
      <div className="h-[18px]" /> {/* Bottom spacer */}
    </div>
  );
}

interface TripleScrollNumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
}

export function TripleScrollNumberPicker({ value, onChange, max }: TripleScrollNumberPickerProps) {
  const [hundreds, setHundreds] = useState(Math.floor(value / 100));
  const [tens, setTens] = useState(Math.floor((value % 100) / 10));
  const [ones, setOnes] = useState(value % 10);

  useEffect(() => {
    const newValue = hundreds * 100 + tens * 10 + ones;
    onChange(Math.min(newValue, max));
  }, [hundreds, tens, ones, onChange, max]);

  return (
    <div className="flex space-x-1 justify-center">
      <ScrollColumn value={hundreds} onChange={setHundreds} max={9} />
      <ScrollColumn value={tens} onChange={setTens} max={9} />
      <ScrollColumn value={ones} onChange={setOnes} max={9} />
    </div>
  );
}

