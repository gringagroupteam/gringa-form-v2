"use client";

import { useState, useRef, useEffect } from "react";

interface LongTextProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxChars?: number;
}

export function LongText({ value, onChange, placeholder, maxChars }: LongTextProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "80px"; // Reset to min-height to compute true scrollHeight
      const newHeight = Math.max(80, Math.min(el.scrollHeight, 240));
      el.style.height = `${newHeight}px`;
      el.style.overflowY = el.scrollHeight > 240 ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  return (
    <div className="relative w-full pb-1">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          if (maxChars && e.target.value.length > maxChars) return;
          onChange(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full min-h-[80px] bg-transparent border-0 border-b border-line px-0 py-2 font-sans text-[18px] leading-[1.5] tracking-[-0.02em] text-ink placeholder:text-ink-muted focus:ring-0 focus:outline-none resize-none"
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
