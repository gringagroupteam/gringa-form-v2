import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = React.memo(({ progress }: ProgressBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-line z-50 overflow-hidden">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";
