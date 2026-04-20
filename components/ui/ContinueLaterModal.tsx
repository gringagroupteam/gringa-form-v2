"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_ENTER } from "@/lib/motion";
import { sendEmail } from "@/lib/email/client";
import { useFormContext } from "@/lib/state/FormContext";

interface ContinueLaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken: string;
}

export function ContinueLaterModal({ isOpen, onClose, sessionToken }: ContinueLaterModalProps) {
  const { state } = useFormContext();
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<"idle" | "sending" | "sent" | "error">("idle");
  
  const resumeUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/briefing?token=${sessionToken}`
    : ``;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleSendEmail = async () => {
    if (!state.email || emailFeedback === "sending") return;
    setEmailFeedback("sending");
    try {
      await sendEmail({
        to: state.email,
        link: resumeUrl,
        type: "resume",
      });
      setEmailFeedback("sent");
      setTimeout(() => setEmailFeedback("idle"), 3000);
    } catch (err) {
      console.error(err);
      setEmailFeedback("error");
      setTimeout(() => setEmailFeedback("idle"), 3000);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: EASE_ENTER }}
              className="w-full max-w-[420px] bg-bg p-10 pointer-events-auto relative shadow-2xl"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-[24px] text-ink-soft hover:text-ink leading-none transition-colors"
                aria-label="Close"
              >
                ×
              </button>

              <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-4 block">
                Save your progress
              </span>
              
              <h2 className="font-editorial font-normal text-[28px] tracking-[-0.02em] text-ink mb-3">
                Your form is saved.
              </h2>
              
              <p className="font-sans text-[15px] text-ink-soft leading-[1.6] mb-8">
                We&apos;ve saved your progress automatically. To return on another device or browser, copy the link below.
              </p>

              <div className="flex flex-col gap-3 mb-8">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between gap-4 bg-surface border border-line py-3 px-4 text-left transition-colors hover:border-ink-soft group"
                >
                  <span className="font-sans text-[13px] text-ink-soft truncate">
                    {resumeUrl}
                  </span>
                  <span className="font-sans font-medium text-[11px] uppercase tracking-[0.08em] text-accent shrink-0">
                    {copyFeedback ? "Copied ✓" : "Copy"}
                  </span>
                </button>
                <p className="font-sans italic text-[13px] text-ink-muted">
                  You can also just return to this browser — your progress is here.
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <button
                  onClick={handleSendEmail}
                  disabled={emailFeedback === "sending" || !state.email}
                  className="w-full flex items-center justify-between gap-4 bg-ink text-bg py-4 px-6 text-left transition-colors hover:bg-ink-soft disabled:opacity-50"
                >
                  <span className="font-sans font-medium text-[11px] uppercase tracking-[0.08em]">
                    {emailFeedback === "idle" && "Send link to my email →"}
                    {emailFeedback === "sending" && "Sending..."}
                    {emailFeedback === "sent" && "Sent ✓"}
                    {emailFeedback === "error" && "Error - Try again"}
                  </span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink py-4 border border-line hover:border-ink transition-colors"
                >
                  Return to form
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
