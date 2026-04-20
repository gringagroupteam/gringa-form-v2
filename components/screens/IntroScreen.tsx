"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormContext } from "@/lib/state/FormContext";
import { PageFrame } from "@/components/ui/PageFrame";
import { NextButton } from "@/components/ui/NextButton";
import { formTemplate } from "@/lib/form-template";
import { getActiveSession, GringaSession } from "@/lib/session";
import { motion, AnimatePresence } from "framer-motion";

function IntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initSession, resumeSession, startOver } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const [activeSession, setActiveSession] = useState<GringaSession | null>(null);
  const [isStartingOver, setIsStartingOver] = useState(false);

  const isCompleted = searchParams.get("completed") === "true";

  useEffect(() => {
    async function checkSession() {
      const session = await getActiveSession();
      if (session && !session.completed) {
        setActiveSession(session);
      }
    }
    checkSession();
  }, []);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showButton = isValidEmail(inputValue);

  const handleBegin = async () => {
    if (showButton) {
      await initSession(inputValue);
      router.push("/start");
    }
  };

  const handleResume = () => {
    if (activeSession) {
      resumeSession(activeSession);
      router.push(`/briefing?token=${activeSession.token}`);
    }
  };

  const handleStartOver = () => {
    setIsStartingOver(true);
    setTimeout(() => {
      startOver();
      setActiveSession(null);
      setIsStartingOver(false);
    }, 200);
  };

  return (
    <>
      <PageFrame number="000" />
      <div className="w-full max-w-[720px] flex flex-col py-8 md:py-12 px-6 md:px-0">
        
        <h1 className="font-editorial font-extralight text-[56px] md:text-[80px] leading-[1.0] tracking-[-0.03em] mb-6 text-center">
          {formTemplate.intro.headline.replace('.', '')}<span className="text-accent">.</span>
        </h1>

        <div className="flex flex-col gap-4 text-[15px] md:text-[16px] leading-[1.5] tracking-[-0.02em] font-sans text-ink-soft mb-8 px-4 md:px-12 text-center">
          {formTemplate.intro.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="flex flex-col items-center border border-line p-6 mb-8">
          <h2 className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-4">
            How it works
          </h2>
          <div className="flex flex-col gap-2 font-sans text-[13px] leading-[1.5] tracking-[-0.02em] text-ink-soft">
            <p>(001) The first block is personal. Each founder answers alone.</p>
            <p>(002) After that, everything is answered together. Sit down, pour a drink, and make a night of it.</p>
            <p>(003) You can save and return whenever you want.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-12 text-center">
          <span>Estimated time: {formTemplate.intro.estimatedTime}</span>
          <span className="hidden sm:inline">·</span>
          <span>{formTemplate.intro.suggestedFormat}</span>
        </div>

        <div className="flex flex-col items-center w-full max-w-[420px] mx-auto min-h-[140px]">
          <AnimatePresence mode="wait">
            {activeSession && !isStartingOver ? (
              <motion.div 
                key="resume-ui"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full border-l-[3px] border-accent pl-6 py-4"
              >
                <div className="flex flex-col items-start gap-4">
                  <div>
                    <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted block mb-1">
                      Continue where you left off
                    </span>
                    <p className="font-sans text-[15px] text-ink-soft">
                      We found an unfinished form for <span className="text-ink font-medium">{activeSession.email}</span>.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-start gap-3 mt-2">
                    <NextButton label="Resume →" onClick={handleResume} show={true} />
                    <button 
                      onClick={handleStartOver}
                      className="font-sans text-[12px] text-ink-muted hover:text-ink underline transition-colors"
                    >
                      Start over instead
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="new-user-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: isStartingOver ? 0.15 : 0 }}
                className="flex flex-col items-center w-full max-w-[320px] gap-12"
              >
                <div className="w-full relative">
                  <input
                    type="text"
                    placeholder="name@company.com"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && showButton) handleBegin();
                    }}
                    className="w-full bg-transparent border-b border-line text-ink placeholder:text-ink-muted py-3 px-0 font-sans text-[16px] tracking-[-0.02em] focus:outline-none focus:border-accent transition-colors"
                  />
                  <label className="absolute -top-6 left-0 font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted">
                    Your email
                  </label>
                </div>

                <NextButton label="Begin →" onClick={handleBegin} show={showButton} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isCompleted && (
          <p className="font-sans text-[13px] text-ink-muted text-center mt-12">
            This form has already been submitted.
          </p>
        )}

      </div>
    </>
  );
}

export function IntroScreen() {
  return (
    <Suspense fallback={null}>
      <IntroContent />
    </Suspense>
  );
}
