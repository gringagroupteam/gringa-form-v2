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

interface FormContextType {
  state: FormState;
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

const FormContext = createContext<FormContextType | undefined>(undefined);

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
      setState(prev => ({ ...prev, isSyncing: true }));
      
      const updatedSession: GringaSession = {
        ...state.session!,
        answers: state.answers,
        currentStepIndex: state.currentStepIndex,
        gate: state.gate,
      };

      try {
        await saveSession(updatedSession);
        // Note: We don't necessarily need to update state.session here 
        // to avoid infinite loops, but we should mark sync as done
        setState(prev => ({ ...prev, isSyncing: false, session: updatedSession }));
      } catch (err) {
        console.error("Auto-save failed:", err);
        setState(prev => ({ ...prev, isSyncing: false }));
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state.answers, state.currentStepIndex, state.gate, state.session]);

  const initSession = async (email: string) => {
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
  };

  const resumeSession = (session: GringaSession) => {
    setState((prev) => ({
      ...prev,
      session,
      email: session.email,
      gate: session.gate,
      currentStepIndex: session.currentStepIndex,
      answers: session.answers,
    }));
    // Note: session.token is already handled by lib/session internal persistence
  };

  const setRespondent = (respondent: Respondent) => {
    setState((prev) => ({ ...prev, activeRespondent: respondent }));
  };

  const setGate = (gate: string) => {
    setState((prev) => ({ ...prev, gate }));
  };

  const setAnswer = (questionId: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      }
    }));
  };

  const setCurrentStep = (index: number) => {
    setState((prev) => ({ ...prev, currentStepIndex: index }));
  };

  const completeForm = async () => {
    if (state.session) {
      await markCompleted(state.session.token);
      clearActiveSession();
      setState(defaultState);
    }
  };

  const startOver = () => {
    clearActiveSession();
    setState(defaultState);
  };

  return (
    <FormContext.Provider value={{ 
      state, 
      initSession, 
      resumeSession, 
      setRespondent,
      setGate, 
      setAnswer, 
      setCurrentStep, 
      completeForm,
      startOver
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
