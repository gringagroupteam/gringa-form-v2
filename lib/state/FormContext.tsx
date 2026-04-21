"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { GringaSession, createSession, saveSession, getActiveSession, markCompleted, clearActiveSession, Respondent } from "@/lib/session";

interface FormState {
  session: GringaSession | null;
  activeRespondent: Respondent | null;
  email: string | null;
  gate: string | null;
  currentStepIndex: number;
  answers: Record<string, unknown>;
  isSyncing: boolean; // Tracking DB sync status
}

}

interface FormActions {
  initSession: (email: string) => Promise<void>;
  resumeSession: (session: GringaSession) => void;
  setRespondent: (respondent: Respondent) => void;
  setGate: (gate: string) => void;
  setAnswer: (questionId: string, value: unknown) => void;
  setCurrentStep: (index: number) => void;
  completeForm: () => Promise<void>;
  startOver: () => void;
}

const defaultState: FormState = {
  session: null,
  activeRespondent: null,
  email: null,
  gate: null,
  currentStepIndex: 0,
  answers: {},
  isSyncing: false,
};

const FormStateContext = createContext<FormState | undefined>(undefined);
const FormActionsContext = createContext<FormActions | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FormState>(defaultState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hydrate on mount
  useEffect(() => {
    async function hydrate() {
      const activeSession = await getActiveSession();
      if (activeSession && !activeSession.completed) {
        resumeSession(activeSession);
      }
    }
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AUTO-SAVE EFFECT
  // Syncs local state changes to Supabase with debouncing
  useEffect(() => {
    if (!state.session || state.session.completed) return;

    // Check if anything actually changed relative to session source
    const hasChanged = 
      state.answers !== state.session.answers ||
      state.currentStepIndex !== state.session.currentStepIndex ||
      state.gate !== state.session.gate;

    if (!hasChanged) return;

    // Debounce saves to 1 second
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      // Don't mark isSyncing if we've already unmounted or session changed
      setState(prev => prev.session?.token === state.session?.token ? { ...prev, isSyncing: true } : prev);
      
      const sessionToSave: GringaSession = {
        ...state.session!,
        answers: state.answers,
        currentStepIndex: state.currentStepIndex,
        gate: state.gate,
      };

      try {
        await saveSession(sessionToSave);
        setState(prev => {
          if (prev.session?.token !== sessionToSave.token) return prev;
          return { 
            ...prev, 
            isSyncing: false, 
            session: sessionToSave 
          };
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
        setState(prev => ({ ...prev, isSyncing: false }));
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state.answers, state.currentStepIndex, state.gate, state.session]);

  const initSession = React.useCallback(async (email: string) => {
    const session = await createSession(email);
    setState({
      session,
      activeRespondent: null,
      email: session.email,
      gate: session.gate,
      currentStepIndex: session.currentStepIndex,
      answers: session.answers,
      isSyncing: false,
    });
  }, []);

  const resumeSession = React.useCallback((session: GringaSession) => {
    setState((prev) => ({
      ...prev,
      session,
      email: session.email,
      gate: session.gate,
      currentStepIndex: session.currentStepIndex,
      answers: session.answers,
    }));
  }, []);

  const setRespondent = React.useCallback((respondent: Respondent) => {
    setState((prev) => ({ ...prev, activeRespondent: respondent }));
  }, []);

  const setGate = React.useCallback((gate: string) => {
    setState((prev) => ({ ...prev, gate }));
  }, []);

  const setAnswer = React.useCallback((questionId: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      }
    }));
  }, []);

  const setCurrentStep = React.useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentStepIndex: index }));
  }, []);

  const completeForm = React.useCallback(async () => {
    setState(prev => {
      if (prev.session) {
        markCompleted(prev.session.token);
      }
      return prev;
    });
    clearActiveSession();
    setState(defaultState);
  }, []);

  const startOver = React.useCallback(() => {
    clearActiveSession();
    setState(defaultState);
  }, []);

  const actions = React.useMemo(() => ({
    initSession,
    resumeSession,
    setRespondent,
    setGate,
    setAnswer,
    setCurrentStep,
    completeForm,
    startOver
  }), [
    initSession,
    resumeSession,
    setRespondent,
    setGate,
    setAnswer,
    setCurrentStep,
    completeForm,
    startOver
  ]);

  return (
    <FormStateContext.Provider value={state}>
      <FormActionsContext.Provider value={actions}>
        {children}
      </FormActionsContext.Provider>
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  const context = useContext(FormStateContext);
  if (context === undefined) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  return context;
}

export function useFormActions() {
  const context = useContext(FormActionsContext);
  if (context === undefined) {
    throw new Error("useFormActions must be used within a FormProvider");
  }
  return context;
}

// For backward compatibility only - avoid using for new performance-tuned code
export function useFormContext() {
  const state = useFormState();
  const actions = useFormActions();
  return { state, ...actions };
}
