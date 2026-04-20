"use client";

import { useState, useEffect } from "react";
import { Respondent, loadSession } from "@/lib/session";

interface WaitingScreenProps {
  respondents: Respondent[];
  sessionToken: string;
  onTogetherReady: () => void;
}

export function WaitingScreen({ respondents: initialRespondents, sessionToken, onTogetherReady }: WaitingScreenProps) {
  const [respondents, setRespondents] = useState<Respondent[]>(initialRespondents);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    // Poll Supabase/localStorage
    const session = await loadSession(sessionToken);
    if (session && session.respondents) {
      setRespondents(session.respondents);
      if (session.togetherUnlocked) {
        onTogetherReady();
      }
    }
    setTimeout(() => setIsChecking(false), 800);
  };

  // Auto-check every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const session = await loadSession(sessionToken);
      if (session && session.respondents) {
        setRespondents(session.respondents);
        if (session.togetherUnlocked) {
          onTogetherReady();
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [sessionToken, onTogetherReady]);

  return (
    <div className="w-full max-w-[480px] mx-auto px-6 flex flex-col justify-center min-h-[70vh]">
      
      <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-8 text-center md:text-left">
        You&apos;re done with your part
      </span>

      <h2 className="font-editorial font-extralight italic text-[36px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-ink mb-6 text-center md:text-left">
        Now we wait.
      </h2>
      
      <p className="font-sans text-[16px] leading-[1.65] text-ink-soft mb-12 text-center md:text-left">
        We&apos;ll email you both once everyone has finished their individual section. Then you&apos;ll answer the rest together.
      </p>

      <div className="flex flex-col border-t border-line mb-10">
        {respondents.map((r) => (
          <div key={r.token} className="py-4 border-b border-line flex justify-between items-center">
            <span className="font-sans text-[14px] text-ink truncate mr-4">
              {r.email}
            </span>
            {r.individualComplete ? (
              <span className="font-sans font-medium text-[11px] tracking-[1px] uppercase text-ink flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-ink" /> Complete
              </span>
            ) : (
              <span className="font-sans font-medium text-[11px] tracking-[1px] uppercase text-ink-muted shrink-0">
                Pending...
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center md:items-start gap-6">
        <button 
          onClick={checkStatus}
          disabled={isChecking}
          className="font-sans text-[13px] text-ink hover:underline transition-all disabled:opacity-50"
        >
          {isChecking ? "Checking..." : "Check status"}
        </button>
        
        <p className="font-sans text-[11px] text-ink-muted italic">
          You can close this window now. We&apos;ll notify you when it&apos;s time.
        </p>
      </div>

    </div>
  );
}
