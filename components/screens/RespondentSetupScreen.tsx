"use client";

import { useState } from "react";
import { PageFrame } from "@/components/ui/PageFrame";
import { NextButton } from "@/components/ui/NextButton";
import { addRespondent, Respondent, GringaSession, saveSession } from "@/lib/session";
import { sendEmail } from "@/lib/email/client";

interface RespondentSetupScreenProps {
  gate: string;
  session: GringaSession;
  onComplete: (respondents: Respondent[]) => void;
}

export function RespondentSetupScreen({ gate, session, onComplete }: RespondentSetupScreenProps) {
  
  // Person 1 is always the primary
  const [emails, setEmails] = useState<string[]>(() => {
    if (gate === "duo") return [""];
    if (gate === "trio_plus") return ["", ""];
    return [""];
  });

  const [names, setNames] = useState<string[]>(() => {
    if (gate === "duo") return [""];
    if (gate === "trio_plus") return ["", ""];
    return [""];
  });

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allValid = emails.every(e => isValidEmail(e));

  const handleAddField = () => {
    if (emails.length < 4) {
      setEmails([...emails, ""]);
      setNames([...names, ""]);
    }
  };

  const updateEmail = (index: number, val: string) => {
    const newEmails = [...emails];
    newEmails[index] = val;
    setEmails(newEmails);
  };

  const updateName = (index: number, val: string) => {
    const newNames = [...names];
    newNames[index] = val;
    setNames(newNames);
  };

  const handleSendLinks = async () => {
    if (!allValid || isSending) return;
    setIsSending(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const respondents: Respondent[] = [];

      // 1. Primary respondent (You)
      const primaryResp: Respondent = {
        email: session.email,
        name: "You",
        token: session.token, // Reusing session token for Person A link
        individualComplete: false,
      };
      
      // Update session with its first respondent
      const updatedSession = { ...session, respondents: [primaryResp] };
      await saveSession(updatedSession);
      respondents.push(primaryResp);

      // 2. Additional respondents
      for (let i = 0; i < emails.length; i++) {
        const resp = await addRespondent(session.token, emails[i], names[i] || undefined);
        respondents.push(resp);
      }

      // 3. Send emails
      const sendPromises = respondents.map(r => {
        const link = `${origin}/briefing?token=${session.token}&respondent=${r.token}`;
        return sendEmail({
          to: r.email,
          name: r.name,
          link,
          type: "individual",
        });
      });

      await Promise.all(sendPromises);
      onComplete(respondents);
      
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to send links. Please try again.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <PageFrame number="(setup)" />
      <div className="w-full max-w-[560px] mx-auto px-6 py-24 flex flex-col justify-center min-h-[70vh]">
        
        <div className="mb-12">
          <h2 className="font-editorial font-extralight text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-ink mb-4">
            Who else is answering?
          </h2>
          <p className="font-sans text-[16px] text-ink-soft leading-[1.6]">
            We&apos;ll send each person their own private link for the first section. After that, you&apos;ll answer together.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {/* Person 1 (Primary) */}
          <div className="flex flex-col gap-2 opacity-50">
            <span className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-ink-muted">
              Person 1 (You)
            </span>
            <div className="border-b border-line py-2 text-ink font-sans">
              {session.email}
            </div>
          </div>

          {/* Additional Persons */}
          {emails.map((email, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <div className="relative">
                <span className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-ink-muted block mb-1">
                  Person {idx + 2}
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => updateEmail(idx, e.target.value)}
                  className="w-full bg-transparent border-b border-line text-ink placeholder:text-ink-muted py-2 px-0 font-sans text-[16px] tracking-[-0.02em] focus:outline-none focus:border-accent transition-colors"
                />
                <input
                  type="text"
                  placeholder="First name (optional)"
                  value={names[idx]}
                  onChange={(e) => updateName(idx, e.target.value)}
                  className="w-full bg-transparent border-b border-line text-ink-muted placeholder:text-ink-muted/50 py-1 px-0 font-sans text-[13px] tracking-[-0.02em] focus:outline-none focus:border-ink-soft mt-1 transition-colors"
                />
              </div>
            </div>
          ))}

          {gate === "trio_plus" && emails.length < 4 && (
            <button 
              onClick={handleAddField}
              className="font-sans text-[13px] text-ink-muted hover:text-ink underline text-left transition-colors"
            >
              + Add another
            </button>
          )}
        </div>

        <div className="mt-16 flex flex-col items-start gap-4">
          {error && (
            <p className="text-accent font-sans text-[13px] mb-2">{error}</p>
          )}
          <NextButton 
            label={isSending ? "Sending..." : "Send links →"} 
            onClick={handleSendLinks} 
            show={allValid} 
          />
        </div>

      </div>
    </>
  );
}
