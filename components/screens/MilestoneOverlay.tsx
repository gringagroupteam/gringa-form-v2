"use client";

import { useEffect, useState } from "react";

interface MilestoneOverlayProps {
  message: string;
  onDone: () => void;
}

export function MilestoneOverlay({ message, onDone }: MilestoneOverlayProps) {
  const [opacity, setOpacity] = useState(0);
  const [textState, setTextState] = useState({ opacity: 0, y: 12 });

  useEffect(() => {
    // 1. Overlay fades in (400ms)
    const t1 = setTimeout(() => setOpacity(1), 50);
    
    // 2. Text fades in (delay 200ms)
    const t2 = setTimeout(() => setTextState({ opacity: 1, y: 0 }), 250);
    
    // 3. Text fades out (after ~1900ms)
    const t3 = setTimeout(() => setTextState({ opacity: 0, y: -12 }), 1900);
    
    // 4. Overlay fades out (after 2200ms)
    const t4 = setTimeout(() => setOpacity(0), 2200);
    
    // 5. Fire done callback (wait for overlay transition 400ms)
    const t5 = setTimeout(() => onDone(), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onDone]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-bg flex items-center justify-center px-6"
      style={{ 
        opacity, 
        transition: 'opacity 400ms ease-in-out',
      }}
    >
      <div 
        className="text-center max-w-[640px]"
        style={{
          opacity: textState.opacity,
          transform: `translateY(${textState.y}px)`,
          transition: 'all 500ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <span className="font-editorial font-extralight italic text-[28px] md:text-[40px] tracking-[-0.02em] text-ink">
          {message}
        </span>
      </div>
    </div>
  );
}
