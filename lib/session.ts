"use client";

import { supabase } from "./supabase";

export interface Respondent {
  email: string;
  name?: string;
  token: string;             // unique per respondent
  individualComplete: boolean;
  individualCompletedAt?: string;
}

export interface GringaSession {
  token: string;             // primary session token (Person A / solo)
  email: string;
  gate: string | null;
  currentStepIndex: number;
  answers: Record<string, unknown>;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  completed: boolean;
  
  // New fields for duo/multi:
  respondents: Respondent[];         // empty array for solo
  allIndividualComplete: boolean;    // false until all respondents done Block 001
  togetherUnlocked: boolean;         // true when allIndividualComplete
  togetherStarted: boolean;          // true when someone clicked into Block 002
}

const STORAGE_PREFIX = "gringa_";
const ACTIVE_TOKEN_KEY = `${STORAGE_PREFIX}active_token`;

export function generateToken(): string {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
}

export function generateRespondentToken(): string {
  return "r_" + generateToken();
}

const isClient = typeof window !== "undefined";

/**
 * Creates a new session in both Supabase and localStorage.
 */
export async function createSession(email: string): Promise<GringaSession> {
  const token = generateToken();
  const now = new Date().toISOString();
  
  const session: GringaSession = {
    token,
    email,
    gate: null,
    currentStepIndex: 0,
    answers: {},
    createdAt: now,
    updatedAt: now,
    completed: false,
    respondents: [],
    allIndividualComplete: false,
    togetherUnlocked: false,
    togetherStarted: false,
  };

  // 1. Save to Supabase
  try {
    const { error } = await supabase
      .from("sessions")
      .insert({
        token: session.token,
        email: session.email,
        gate: session.gate,
        current_step_index: session.currentStepIndex,
        answers: session.answers,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
        completed: session.completed,
        all_individual_complete: session.allIndividualComplete,
        together_unlocked: session.togetherUnlocked,
        together_started: session.togetherStarted,
      });
    
    if (error) console.error("Supabase create error:", error);
  } catch (err) {
    console.error("Failed to sync with Supabase:", err);
  }

  // 2. Local fallback
  if (isClient) {
    localStorage.setItem(`${STORAGE_PREFIX}session_${token}`, JSON.stringify(session));
    localStorage.setItem(ACTIVE_TOKEN_KEY, token);
  }

  return session;
}

/**
 * Saves an existing session to Supabase and localStorage.
 */
export async function saveSession(session: GringaSession): Promise<void> {
  const now = new Date().toISOString();
  const updatedSession = {
    ...session,
    updatedAt: now,
  };

  // 1. Local storage first (Optimistic)
  if (isClient) {
    localStorage.setItem(`${STORAGE_PREFIX}session_${session.token}`, JSON.stringify(updatedSession));
  }

  // 2. Sync with Supabase (Background)
  // We do not await this to prevent blocking the UI
  (async () => {
    try {
      // Update main session
      const { error: sessionError } = await supabase
        .from("sessions")
        .update({
          email: updatedSession.email,
          gate: updatedSession.gate,
          current_step_index: updatedSession.currentStepIndex,
          answers: updatedSession.answers,
          updated_at: updatedSession.updatedAt,
          completed: updatedSession.completed,
          all_individual_complete: updatedSession.allIndividualComplete,
          together_unlocked: updatedSession.togetherUnlocked,
          together_started: updatedSession.togetherStarted,
        })
        .eq("token", updatedSession.token);

      if (sessionError) console.error("Supabase map error (likely RLS):", sessionError);

      // Sync respondents if any
      if (updatedSession.respondents.length > 0) {
        const { data: dbSession } = await supabase
          .from("sessions")
          .select("id")
          .eq("token", updatedSession.token)
          .single();
        
        if (dbSession) {
          for (const resp of updatedSession.respondents) {
            await supabase
              .from("respondents")
              .upsert({
                session_id: dbSession.id,
                email: resp.email,
                name: resp.name,
                token: resp.token,
                individual_complete: resp.individualComplete,
                individual_completed_at: resp.individualCompletedAt,
              });
          }
        }
      }
    } catch (err) {
      console.error("CRITICAL: Supabase background sync failed!", err);
    }
  })();
}

/**
 * Loads a session by token, preferential to Supabase with localStorage fallback.
 */
export async function loadSession(token: string): Promise<GringaSession | null> {
  // 1. First, check local storage for instant response
  let localSession: GringaSession | null = null;
  if (isClient) {
    const localData = localStorage.getItem(`${STORAGE_PREFIX}session_${token}`);
    if (localData) {
      try { localSession = JSON.parse(localData) as GringaSession; } catch { /* ignore */ }
    }
  }

  // 2. Try Supabase in parallel/background to refresh (with simple retry)
  let attempts = 0;
  const maxAttempts = 3;
  let sessionData = null;
  let respData = null;

  while (attempts < maxAttempts) {
    try {
      const { data: sData, error: sError } = await supabase
        .from("sessions")
        .select("*")
        .eq("token", token)
        .single();

      if (sData && !sError) {
        sessionData = sData;
        const { data: rData } = await supabase
          .from("respondents")
          .select("*")
          .eq("session_id", sData.id);
        respData = rData;
        break;
      }
    } catch (err) {
      console.warn(`Supabase load attempt ${attempts + 1} failed:`, err);
    }
    attempts++;
    if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 500 * attempts));
  }

  if (sessionData) {

      const session: GringaSession = {
        token: sessionData.token,
        email: sessionData.email,
        gate: sessionData.gate,
        currentStepIndex: sessionData.current_step_index,
        answers: sessionData.answers,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
        completed: sessionData.completed,
        allIndividualComplete: sessionData.all_individual_complete,
        togetherUnlocked: sessionData.together_unlocked,
        togetherStarted: sessionData.together_started,
        respondents: (respData || []).map(r => ({
          email: r.email,
          name: r.name,
          token: r.token,
          individualComplete: r.individual_complete,
          individualCompletedAt: r.individual_completed_at,
        })),
      };

      if (isClient) {
        localStorage.setItem(`${STORAGE_PREFIX}session_${token}`, JSON.stringify(session));
      }
      return session;
    }
  } catch (err) {
    console.warn("Supabase load error:", err);
  }

  return localSession;
}

export async function getActiveSession(): Promise<GringaSession | null> {
  if (!isClient) return null;
  
  const token = localStorage.getItem(ACTIVE_TOKEN_KEY);
  if (!token) return null;
  
  return loadSession(token);
}

export function clearActiveSession(): void {
  if (!isClient) return;
  localStorage.removeItem(ACTIVE_TOKEN_KEY);
}

export async function markCompleted(token: string): Promise<void> {
  const session = await loadSession(token);
  if (session) {
    session.completed = true;
    await saveSession(session);
  }
}

// Multi-Respondent Helpers (Refactored for Async/DB)

export async function addRespondent(sessionToken: string, email: string, name?: string): Promise<Respondent> {
  const session = await loadSession(sessionToken);
  if (!session) throw new Error("Session not found");

  const respondent: Respondent = {
    email,
    name,
    token: generateRespondentToken(),
    individualComplete: false,
  };

  session.respondents = [...session.respondents, respondent];
  await saveSession(session);
  return respondent;
}

export async function markRespondentComplete(sessionToken: string, respondentToken: string): Promise<void> {
  const session = await loadSession(sessionToken);
  if (!session) return;

  const respIndex = session.respondents.findIndex(r => r.token === respondentToken);
  if (respIndex === -1) return;

  session.respondents[respIndex].individualComplete = true;
  session.respondents[respIndex].individualCompletedAt = new Date().toISOString();

  // Check if everyone is done
  const allDone = session.respondents.every(r => r.individualComplete === true);
  if (allDone) {
    session.allIndividualComplete = true;
    session.togetherUnlocked = true;
  }

  await saveSession(session);
}

export async function getSessionByRespondentToken(respondentToken: string): Promise<{ session: GringaSession; respondent: Respondent } | null> {
  // Try Supabase directly first - more reliable than scanning localStorage
  try {
    const { data: respData } = await supabase
      .from("respondents")
      .select("*, sessions(*)")
      .eq("token", respondentToken)
      .single();

    if (respData && respData.sessions) {
      const fullSession = await loadSession(respData.sessions.token);
      if (fullSession) {
        const respondent = fullSession.respondents.find(r => r.token === respondentToken)!;
        return { session: fullSession, respondent };
      }
    }
  } catch (err) {
    console.error("Failed to load session by respondent token:", err);
  }

  // Local fallback (legacy scanning)
  if (!isClient) return null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(`${STORAGE_PREFIX}session_`)) {
      try {
        const session = JSON.parse(localStorage.getItem(key)!) as GringaSession;
        if (session.respondents) {
          const respondent = session.respondents.find(r => r.token === respondentToken);
          if (respondent) {
            return { session, respondent };
          }
        }
      } catch { continue; }
    }
  }

  return null;
}

export async function unlockTogether(sessionToken: string): Promise<void> {
  const session = await loadSession(sessionToken);
  if (session) {
    session.togetherStarted = true;
    await saveSession(session);
  }
}
