"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useFormState, useFormActions } from "@/lib/state/FormContext";
import { buildSteps, buildIndividualSteps, buildTogetherSteps, StepType } from "@/lib/steps";
import { ScreenTransition } from "@/components/motion/ScreenTransition";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BlockHeaderScreen } from "@/components/screens/BlockHeaderScreen";
import { QuestionScreen } from "@/components/screens/QuestionScreen";
import { HandoffScreen } from "@/components/screens/HandoffScreen";
import { MilestoneOverlay } from "@/components/screens/MilestoneOverlay";
import { WaitingScreen } from "@/components/screens/WaitingScreen";
import { TogetherReadyScreen } from "@/components/screens/TogetherReadyScreen";
import { loadSession, getSessionByRespondentToken, markRespondentComplete, saveSession, GringaSession } from "@/lib/session";
import { sendEmail } from "@/lib/email/client";
import React from "react";

  const state = useFormState();
  const { setAnswer, resumeSession, setCurrentStep, setRespondent } = useFormActions();
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusScreen, setShowStatusScreen] = useState<"waiting" | "ready" | null>(null);

  const steps = React.useMemo(() => {
    if (!state.gate) return [];
    
    // Logic for step generation
    if (state.activeRespondent && !state.session?.togetherUnlocked) {
      return buildIndividualSteps();
    }
    
    if (state.session?.togetherUnlocked) {
      return buildTogetherSteps();
    }

    return buildSteps();
  }, [state.gate, state.activeRespondent, state.session?.togetherUnlocked]);

  const currentStepIndex = state.currentStepIndex;
  const progress = currentStepIndex / (steps.length - 1);
  const currentStep = steps[currentStepIndex];

  const handleNext = React.useCallback(async (value?: unknown) => {
    let updatedAnswers = state.answers;
    if (currentStep && currentStep.kind === "question" && value !== undefined) {
      setAnswer(currentStep.question.id, value);
      updatedAnswers = { ...state.answers, [currentStep.question.id]: value };
    }

    const nextIndex = currentStepIndex + 1;

    // PERSISTENCE CHECKPOINT
    // Instead of auto-syncing in the background, we save reliably on "Next"
    if (state.session) {
      const sessionToSave: GringaSession = {
        ...state.session,
        answers: updatedAnswers,
        currentStepIndex: nextIndex < steps.length ? nextIndex : currentStepIndex,
        gate: state.gate,
      };
      
      // Save in background to keep UI moving, or await for total safety
      saveSession(sessionToSave).catch(err => console.error("Checkpoint save failed:", err));
    }
    
    // Check if we finished individual individual steps
    if (state.activeRespondent && !state.session?.togetherUnlocked && nextIndex >= steps.length) {
      if (state.session && state.activeRespondent) {
        await markRespondentComplete(state.session.token, state.activeRespondent.token);
        
        // Reload session to check if everyone is done
        const updatedSession = await loadSession(state.session.token);
        if (updatedSession?.allIndividualComplete) {
          // Notify everyone!
          const origin = window.location.origin;
          updatedSession.respondents.forEach(r => {
            sendEmail({
              to: r.email,
              link: `${origin}/briefing?token=${updatedSession.token}`,
              type: 'together_ready'
            }).catch(console.error);
          });
          setShowStatusScreen("ready");
        } else {
          setShowStatusScreen("waiting");
        }
      }
      return;
    }

    if (nextIndex >= steps.length) {
      router.push("/complete");
    } else {
      setDirection("forward");
      setCurrentStep(nextIndex);
    }
  }, [currentStep, currentStepIndex, steps.length, setAnswer, state.activeRespondent, state.session, setCurrentStep, router, state.gate]);

  const handleBack = React.useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setDirection("backward");
      setCurrentStep(prevIndex);
    } else {
      router.push("/start");
    }
  }, [currentStepIndex, setCurrentStep, router]);

  const handleStartTogether = React.useCallback(() => {
    if (state.session) {
      setCurrentStep(0);
      setShowStatusScreen(null);
    }
  }, [state.session, setCurrentStep]);

  // Handle URL token or session detection
  useEffect(() => {
    async function initBriefing() {
      const token = searchParams.get("token");
      const respondentToken = searchParams.get("respondent");

      try {
        if (respondentToken) {
          // Multi-person flow
          const result = await getSessionByRespondentToken(respondentToken);
          if (result) {
            const { session, respondent } = result;
            if (session.completed) {
              router.push("/?completed=true");
              return;
            }
            
            resumeSession(session);
            setRespondent(respondent);
            
            if (respondent.individualComplete && !session.togetherUnlocked) {
              setShowStatusScreen("waiting");
            } else if (session.togetherUnlocked && !session.togetherStarted) {
              setShowStatusScreen("ready");
            } else {
              setCurrentStep(session.currentStepIndex || 0);
            }
            setIsHydrated(true);
          } else {
            router.push("/");
          }
        } else if (token) {
          // Solo flow or primary entry
          const session = await loadSession(token);
          if (session) {
            if (session.completed) {
              router.push("/?completed=true");
              return;
            }
            resumeSession(session);
            setCurrentStep(session.currentStepIndex);
            setIsHydrated(true);
          } else {
            router.push("/");
          }
        } else if (state.gate) {
          // Direct navigation from previous screen
          setIsHydrated(true);
        } else {
          const timer = setTimeout(() => {
            if (!state.gate && !state.session) {
              console.log("No session or gate found after timeout, redirecting to home.");
              router.push("/");
            } else {
              setIsHydrated(true);
            }
          }, 2000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Unable to connect. Please check your internet or refresh.");
      }
    }
    initBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, resumeSession, setRespondent, router, setCurrentStep]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6 text-center">
        <div className="max-w-md">
          <p className="font-sans text-ink-soft mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-accent font-sans font-medium uppercase tracking-wider underline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isHydrated || !state.gate || steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-line border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStepIndex = state.currentStepIndex;
  const progress = currentStepIndex / (steps.length - 1);
  const currentStep = steps[currentStepIndex];

  const handleNext = React.useCallback(async (value?: unknown) => {
    let updatedAnswers = state.answers;
    if (currentStep && currentStep.kind === "question" && value !== undefined) {
      setAnswer(currentStep.question.id, value);
      updatedAnswers = { ...state.answers, [currentStep.question.id]: value };
    }

    const nextIndex = currentStepIndex + 1;

    // PERSISTENCE CHECKPOINT
    // Instead of auto-syncing in the background, we save reliably on "Next"
    if (state.session) {
      const sessionToSave: GringaSession = {
        ...state.session,
        answers: updatedAnswers,
        currentStepIndex: nextIndex < steps.length ? nextIndex : currentStepIndex,
        gate: state.gate,
      };
      
      // Save in background to keep UI moving, or await for total safety
      saveSession(sessionToSave).catch(err => console.error("Checkpoint save failed:", err));
    }
    
    // Check if we finished individual individual steps
    if (state.activeRespondent && !state.session?.togetherUnlocked && nextIndex >= steps.length) {
      if (state.session && state.activeRespondent) {
        await markRespondentComplete(state.session.token, state.activeRespondent.token);
        
        // Reload session to check if everyone is done
        const updatedSession = await loadSession(state.session.token);
        if (updatedSession?.allIndividualComplete) {
          // Notify everyone!
          const origin = window.location.origin;
          updatedSession.respondents.forEach(r => {
            sendEmail({
              to: r.email,
              link: `${origin}/briefing?token=${updatedSession.token}`,
              type: 'together_ready'
            }).catch(console.error);
          });
          setShowStatusScreen("ready");
        } else {
          setShowStatusScreen("waiting");
        }
      }
      return;
    }

    if (nextIndex >= steps.length) {
      router.push("/complete");
    } else {
      setDirection("forward");
      setCurrentStep(nextIndex);
    }
  }, [currentStep, currentStepIndex, steps.length, setAnswer, state.activeRespondent, state.session, setCurrentStep, router, state.gate]);

  const handleBack = React.useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setDirection("backward");
      setCurrentStep(prevIndex);
    } else {
      router.push("/start");
    }
  }, [currentStepIndex, setCurrentStep, router]);

  const handleStartTogether = React.useCallback(() => {
    if (state.session) {
      setCurrentStep(0);
      setShowStatusScreen(null);
    }
  }, [state.session, setCurrentStep]);

  if (showStatusScreen === "waiting") {
    return (
      <WaitingScreen 
        respondents={state.session?.respondents || []} 
        sessionToken={state.session?.token || ""} 
        onTogetherReady={() => setShowStatusScreen("ready")}
      />
    );
  }

  if (showStatusScreen === "ready") {
    return <TogetherReadyScreen onNext={handleStartTogether} />;
  }

  const renderStep = (step: StepType) => {
    switch (step.kind) {
      case "block_header":
        return (
          <BlockHeaderScreen
            block={step.block}
            blockNumber={step.block.id}
            onNext={handleNext}
          />
        );
      case "question":
        return (
          <QuestionScreen
            question={step.question}
            blockId={step.block.id}
            questionIndex={step.questionIndex}
            totalInBlock={step.totalInBlock}
            onNext={handleNext}
            onBack={handleBack}
            existingAnswer={state.answers[step.question.id]}
          />
        );
      case "handoff":
        return <HandoffScreen onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ProgressBar progress={progress} />
      
      <ScreenTransition 
        direction={direction} 
        stepKey={`step-${state.session?.togetherUnlocked ? 'together' : 'indiv'}-${currentStepIndex}`}
      >
        {currentStep && currentStep.kind !== "milestone" ? (
          renderStep(currentStep)
        ) : (
          <div className="w-full min-h-[60vh]" />
        )}
      </ScreenTransition>

      {currentStep && currentStep.kind === "milestone" && (
        <MilestoneOverlay message={currentStep.message} onDone={handleNext} />
      )}
    </>
  );
}

export default function BriefingPage() {
  return (
    <Suspense fallback={null}>
      <BriefingContent />
    </Suspense>
  );
}
