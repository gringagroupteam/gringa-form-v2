"use client";

import { useEffect, useState } from "react";
import { Block } from "@/lib/form-template";
import { PageFrame } from "@/components/ui/PageFrame";
import { ContinueLaterModal } from "@/components/ui/ContinueLaterModal";
import { useFormContext } from "@/lib/state/FormContext";

interface BlockHeaderScreenProps {
  block: Block;
  onNext: () => void;
  blockNumber: string;
}

export function BlockHeaderScreen({ block, onNext, blockNumber }: BlockHeaderScreenProps) {
  const { state } = useFormContext();
  const [clicked, setClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (clicked) return;
    const timer = setTimeout(() => {
      onNext();
    }, 4000);
    return () => clearTimeout(timer);
  }, [clicked, onNext]);

  const handleNext = () => {
    setClicked(true);
    onNext();
  };

  return (
    <>
      <PageFrame number={blockNumber} />
      <div className="w-full max-w-[640px] mx-auto px-6 flex flex-col justify-center min-h-[60vh]">
        <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-8">
          {block.mode === "individual" ? "ANSWERED INDIVIDUALLY" : "ANSWERED TOGETHER"}
        </span>
        
        <h2 className="font-editorial font-extralight text-[48px] md:text-[72px] leading-[1.0] tracking-[-0.03em] text-ink">
          {block.title}
        </h2>
        
        <div className="h-[1px] w-[48px] bg-line my-8" />
        
        <p className="font-sans text-[16px] leading-[1.65] text-ink-soft max-w-[480px] mb-16">
          {block.intro}
        </p>

        <div className="flex flex-col items-start gap-3">
          <button
            onClick={handleNext}
            className="font-sans font-medium text-[14px] tracking-[0.08em] uppercase text-ink hover:underline focus-visible:outline focus-visible:outline-[1px] focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Begin →
          </button>
          
          {/* Animated 3 dots countdown */}
          {!clicked && (
             <div className="flex gap-[4px] items-center ml-1">
               {[0, 1, 2].map((i) => (
                 <div
                   key={i}
                   className="w-[4px] h-[4px] rounded-full bg-ink-muted"
                   style={{
                     opacity: 0.2,
                     animation: `fillDot 1.33s linear forwards`,
                     animationDelay: `${i * 1.33}s`,
                   }}
                 />
               ))}
             </div>
          )}
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fillDot {
              0% { opacity: 0.2; }
              100% { opacity: 1; }
            }
          `}} />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-8 left-6 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="font-sans text-[11px] text-ink-muted hover:underline text-left"
        >
          Continue later
        </button>
      </div>

      <ContinueLaterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        sessionToken={state.session?.token || ""} 
      />
    </>
  );
}
