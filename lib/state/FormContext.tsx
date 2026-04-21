"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { GringaSession, createSession, getActiveSession, markCompleted, clearActiveSession, Respondent } from "@/lib/session";

interface FormState {
  session: GringaSession | null;
  activeRespondent: Respondent | null;
  email: string | null;
  gate: string | null;
  currentStepIndex: number;
  answers: Record<string, unknown>;
  isSyncing: boolean; // Tracking DB sync status
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
      // Priority to local currentStepIndex if already active to prevent "jumps"
      currentStepIndex: prev.session ? prev.currentStepIndex : session.currentStepIndex,
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
