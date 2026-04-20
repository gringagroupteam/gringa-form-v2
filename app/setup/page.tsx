"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormContext } from "@/lib/state/FormContext";
import { RespondentSetupScreen } from "@/components/screens/RespondentSetupScreen";
import { LinkSentScreen } from "@/components/screens/LinkSentScreen";
import { loadSession, Respondent } from "@/lib/session";
import { ScreenTransition } from "@/components/motion/ScreenTransition";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, resumeSession } = useFormContext();
  const [isSent, setIsSent] = useState(false);
  const [respondents, setRespondents] = useState<Respondent[]>([]);

  useEffect(() => {
    async function initSetup() {
      const token = searchParams.get("token");
      if (token) {
        const session = await loadSession(token);
        if (session) {
          resumeSession(session);
          if (session.respondents && session.respondents.length > 0) {
            setRespondents(session.respondents);
            setIsSent(true);
          }
        } else {
          router.push("/");
        }
      } else if (!state.session) {
        router.push("/");
      }
    }
    initSetup();
  }, [searchParams, state.session, resumeSession, router]);

  if (!state.session) return null;

  return (
    <ScreenTransition stepKey={isSent ? "sent" : "setup"}>
      {isSent ? (
        <LinkSentScreen 
          respondents={respondents} 
          sessionToken={state.session.token} 
        />
      ) : (
        <RespondentSetupScreen 
          gate={state.gate || "duo"} 
          session={state.session} 
          onComplete={(resps) => {
            setRespondents(resps);
            setIsSent(true);
          }} 
        />
      )}
    </ScreenTransition>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={null}>
      <SetupContent />
    </Suspense>
  );
}
