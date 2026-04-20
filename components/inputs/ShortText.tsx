"use client";

import { useState } from "react";

interface ShortTextProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxChars?: number;
}

export function ShortText({ value, onChange, placeholder, maxChars }: ShortTextProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full pb-1">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (maxChars && e.target.value.length > maxChars) return;
          onChange(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-line px-0 py-2 font-sans text-[18px] tracking-[-0.02em] text-ink placeholder:text-ink-muted focus:ring-0 focus:outline-none"
      />
      {/* Animated Focus Border */}
      <div 
        className="absolute bottom-1 left-0 h-[1px] bg-accent transition-all duration-200 ease-out"
        style={{ width: focused ? '100%' : '0%' }}
      />
      
      {maxChars && focused && (
        <div className="absolute right-0 -bottom-5 font-sans text-[11px] text-ink-muted">
          {value.length} / {maxChars}
        </div>
      )}
    </div>
  );
}
