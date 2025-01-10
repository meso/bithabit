import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
}

export function NumberSelector({ value, onChange, max }: NumberSelectorProps) {
  const digits = String(value).padStart(3, '0').split('');

  const handleDigitChange = (index: number, newValue: string) => {
    const newDigits = [...digits];
    newDigits[index] = newValue;
    const newNumber = parseInt(newDigits.join(''), 10);
    onChange(Math.min(newNumber, max));
  };

  return (
    <div className="flex space-x-1">
      {digits.map((digit, index) => (
        <Select
          key={index}
          value={digit}
          onValueChange={(value) => handleDigitChange(index, value)}
        >
          <SelectTrigger className="w-[3rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => i.toString()).map((num) => (
              <SelectItem key={num} value={num}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

