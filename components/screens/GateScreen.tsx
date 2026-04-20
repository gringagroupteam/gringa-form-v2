"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "@/lib/state/FormContext";
import { PageFrame } from "@/components/ui/PageFrame";
import { formTemplate } from "@/lib/form-template";
import { motion } from "framer-motion";

export function GateScreen() {
  const router = useRouter();
  const { state, setGate } = useFormContext();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setGate(value);
    
    setTimeout(() => {
      if (value === "solo" || value === "corporate") {
        router.push("/briefing?token=" + state.session?.token);
      } else {
        router.push("/setup?token=" + state.session?.token);
      }
    }, 250);
  };

  return (
    <>
      <PageFrame number="001" />
      <div className="w-full max-w-[560px] flex flex-col px-6 sm:px-0 mx-auto">
        
        <div className="flex flex-col mb-16">
          <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-8">
            (gate)
          </span>
          <h2 className="font-editorial font-extralight text-[32px] md:text-[48px] leading-[1.0] tracking-[-0.03em] text-ink">
            {formTemplate.gate.question}
          </h2>
        </div>

        <div className="flex flex-col border-t border-line">
          {formTemplate.gate.options.map((option, index) => {
            const isSelected = selected === option.value;
            const isLast = index === formTemplate.gate.options.length - 1;
            
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`group relative text-left py-7 px-6 transition-colors duration-200 focus-visible:outline-none ${!isLast ? 'border-b border-line' : ''}`}
                style={{ backgroundColor: isSelected ? 'var(--surface)' : 'transparent' }}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" 
                    transition={{ duration: 0.15 }}
                  />
                )}
                
                <div 
                  className="flex flex-col transition-transform duration-150 ease-out" 
                  style={{ transform: isSelected ? 'translateX(8px)' : 'translateX(0)' }}
                >
                  <span className="font-editorial font-normal text-[18px] md:text-[22px] tracking-[-0.02em] text-ink">
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </>
  );
}
