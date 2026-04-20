"use client";

import { useEffect, useState } from "react";
import { NextButton } from "@/components/ui/NextButton";

interface TogetherReadyScreenProps {
  onNext: () => void;
}

export function TogetherReadyScreen({ onNext }: TogetherReadyScreenProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-[560px] mx-auto px-6 flex flex-col justify-center min-h-[80vh]">
      
      <div className="w-[32px] h-[3px] bg-accent mb-12 mx-auto md:mx-0" />
      
      <h2 className="font-editorial font-bold md:font-extrabold text-[36px] md:text-[56px] leading-[1.0] tracking-[-0.03em] text-ink mb-6 text-center md:text-left">
        You&apos;re both ready.
      </h2>
      
      <p className="font-sans text-[18px] leading-[1.65] text-ink-soft max-w-[480px] mb-12 text-center md:text-left">
        Both sections are in. Now sit together, pour something good, and finish this as a team.
      </p>

      <div className="flex justify-center md:justify-start h-10">
        <NextButton label="Let&apos;s go →" onClick={onNext} show={showButton} />
      </div>

    </div>
  );
}
