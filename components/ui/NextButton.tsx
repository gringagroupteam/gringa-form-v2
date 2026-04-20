"use client";

import { motion } from "framer-motion";

interface NextButtonProps {
  label: string;
  onClick: () => void;
  show: boolean;
}

export function NextButton({ label, onClick, show }: NextButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      disabled={!show}
      className={`font-sans font-medium text-[14px] tracking-[0.08em] uppercase text-ink hover:underline focus-visible:outline focus-visible:outline-[1px] focus-visible:outline-offset-4 focus-visible:outline-accent pointer-events-${show ? 'auto' : 'none'}`}
    >
      {label}
    </motion.button>
  );
}
