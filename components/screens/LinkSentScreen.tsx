"use client";

import { Respondent } from "@/lib/session";
import { NextButton } from "@/components/ui/NextButton";
import { useRouter } from "next/navigation";

interface LinkSentScreenProps {
  respondents: Respondent[];
  sessionToken: string;
}

export function LinkSentScreen({ respondents, sessionToken }: LinkSentScreenProps) {
  const router = useRouter();
  
  // The primary person is the first one (Person 1)
  const primaryRespondent = respondents[0];

  const handleOpenMine = () => {
    router.push(`/briefing?token=${sessionToken}&respondent=${primaryRespondent.token}`);
  };

  return (
    <div className="w-full max-w-[560px] mx-auto px-6 flex flex-col justify-center min-h-[80vh]">
      
      <div className="w-[32px] h-[3px] bg-accent mb-12 mx-auto md:mx-0" />
      
      <h2 className="font-editorial font-bold md:font-extrabold text-[36px] md:text-[48px] leading-[1.0] tracking-[-0.03em] text-ink mb-6 text-center md:text-left">
        Links sent.
      </h2>
      
      <p className="font-sans text-[17px] leading-[1.65] text-ink-soft max-w-[500px] mb-12 text-center md:text-left">
        Each person has received their own private link. Answer your section alone, then we&apos;ll bring you together.
      </p>

      <div className="flex flex-col border-t border-line mb-12">
        {respondents.map((r, i) => (
          <div key={r.token} className="py-4 border-b border-line flex justify-between items-center">
            <span className="font-sans text-[14px] text-ink truncate mr-4">
              {r.email} {i === 0 && "(You)"}
            </span>
            <span className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-ink-muted shrink-0">
              Link sent ✓
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center md:items-start gap-4">
        <NextButton label="Open my section →" onClick={handleOpenMine} show={true} />
        <p className="font-sans italic text-[13px] text-ink-muted mt-2">
          The together section unlocks once everyone has finished.
        </p>
      </div>

    </div>
  );
}
