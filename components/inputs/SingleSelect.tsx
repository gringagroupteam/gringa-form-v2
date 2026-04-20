"use client";

import { motion } from "framer-motion";

interface SingleSelectProps {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  // autoAdvance is handled directly by the parent to prevent race conditions during unmounts
}

export function SingleSelect({ options, value, onChange }: SingleSelectProps) {
  return (
    <div className="w-full flex flex-col border-t border-line">
      {options.map((option, index) => {
        const isSelected = value === option;
        const isLast = index === options.length - 1;

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`group relative text-left py-6 px-6 transition-colors duration-200 focus-visible:outline-none ${!isLast ? 'border-b border-line' : ''} hover:bg-white/50`}
            style={{ backgroundColor: isSelected ? 'var(--surface)' : '' }}
          >
            {isSelected && (
              <motion.div 
                layoutId="single-select-indicator"
                className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" 
                transition={{ duration: 0.15 }}
              />
            )}
            
            <div 
              className="flex flex-col transition-transform duration-150 ease-out" 
              style={{ transform: isSelected ? 'translateX(8px)' : 'translateX(0)' }}
            >
              <span className="font-editorial font-normal text-[20px] tracking-[-0.02em] text-ink">
                {option}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
