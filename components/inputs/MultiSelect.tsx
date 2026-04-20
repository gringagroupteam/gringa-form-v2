"use client";

import { motion } from "framer-motion";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  maxSelections?: number;
}

export function MultiSelect({ options, value, onChange, maxSelections }: MultiSelectProps) {
  
  const handleToggle = (option: string) => {
    const isSelected = value.includes(option);
    
    if (isSelected) {
      onChange(value.filter(v => v !== option));
    } else {
      if (maxSelections && value.length >= maxSelections) return;
      onChange([...value, option]);
    }
  };

  const isCapped = maxSelections ? value.length >= maxSelections : false;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          const isDisabled = !isSelected && isCapped;

          return (
            <motion.button
              key={option}
              onClick={() => handleToggle(option)}
              whileTap={{ scale: 0.98 }}
              animate={isSelected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`py-2 px-4 border font-sans text-[13px] tracking-[0.02em] transition-colors hover:border-[var(--ink-soft)] focus-visible:outline-accent`}
              style={{
                borderColor: isSelected ? 'var(--ink)' : 'var(--line)',
                backgroundColor: isSelected ? 'var(--ink)' : 'transparent',
                color: isSelected ? 'white' : 'var(--ink)',
                opacity: isDisabled ? 0.35 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
      
      {maxSelections && (
        <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mt-2">
          {value.length} of {maxSelections} selected
        </span>
      )}
    </div>
  );
}
