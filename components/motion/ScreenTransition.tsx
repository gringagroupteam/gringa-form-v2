"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { EASE_ENTER, EASE_EXIT, SCREEN_DURATION } from "@/lib/motion";

interface ScreenTransitionProps {
  children: ReactNode;
  direction?: "forward" | "backward";
  stepKey?: string;
}

export function ScreenTransition({ children, direction = "forward", stepKey }: ScreenTransitionProps) {
  const pathname = usePathname();

  const isForward = direction === "forward";
  const motionKey = stepKey || pathname;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={motionKey}
        initial={{ opacity: 0, y: isForward ? 14 : -14 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: SCREEN_DURATION, ease: EASE_ENTER },
        }}
        exit={{
          opacity: 0,
          y: isForward ? -6 : 6,
          transition: { duration: 0.28, ease: EASE_EXIT },
        }}
        style={{ willChange: "transform, opacity" }}
        className="w-full min-h-screen flex flex-col items-center justify-center relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
