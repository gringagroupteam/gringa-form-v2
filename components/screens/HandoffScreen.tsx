"use client";

import { useEffect, useState } from "react";
import { NextButton } from "@/components/ui/NextButton";

export function HandoffScreen({ onNext }: { onNext: () => void }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-[560px] mx-auto px-6 flex flex-col justify-center min-h-[60vh]">
      
      <div className="w-[32px] h-[1px] bg-accent mb-12" />
      
      <h2 className="font-editorial font-bold md:font-extrabold text-[36px] md:text-[56px] leading-[1.0] tracking-[-0.03em] text-ink">
        Nice work.
      </h2>
      
      <p className="font-sans text-[18px] leading-[1.65] text-ink-soft max-w-[440px] mt-6 mb-16">
        The rest of this form is for both of you. Find a quiet evening, open a bottle of something good, and take it together. These are the questions that define what you&apos;re building.
      </p>

      <div className="flex justify-start h-10">
        <NextButton label="We're ready →" onClick={onNext} show={showButton} />
      </div>

    </div>
  );
}
