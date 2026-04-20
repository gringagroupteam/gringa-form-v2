"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GringaSession } from "@/lib/session";
import { PageFrame } from "@/components/ui/PageFrame";

interface SupabaseRespondent {
  email: string;
  name: string | null;
  token: string;
  individual_complete: boolean;
  individual_completed_at: string | null;
}

interface SupabaseSession {
  id: string;
  token: string;
  email: string;
  gate: string | null;
  current_step_index: number;
  answers: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed: boolean;
  all_individual_complete: boolean;
  together_unlocked: boolean;
  together_started: boolean;
  respondents: SupabaseRespondent[];
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<(GringaSession & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchSessions();
    }
  }, [isAuthorized]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData, error } = await supabase
        .from("sessions")
        .select(`
          *,
          respondents (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (sessionData) {
        const typedData = sessionData as unknown as SupabaseSession[];
        setSessions(typedData.map((s) => ({
          token: s.token,
          id: s.id,
          email: s.email,
          gate: s.gate,
          currentStepIndex: s.current_step_index,
          answers: s.answers,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
          completed: s.completed,
          allIndividualComplete: s.all_individual_complete,
          togetherUnlocked: s.together_unlocked,
          togetherStarted: s.together_started,
          respondents: s.respondents.map((r) => ({
            email: r.email,
            name: r.name || undefined,
            token: r.token,
            individualComplete: r.individual_complete,
            individualCompletedAt: r.individual_completed_at || undefined,
          })),
        })));
      }
    } catch (err) {
      console.error("Fetch sessions error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gringa2024") { // Temporary static password
      setIsAuthorized(true);
    } else {
      alert("Invalid password");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col gap-6">
          <h1 className="font-editorial text-[32px] text-ink mb-2">Admin Login</h1>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-line p-3 font-sans text-ink focus:outline-none focus:border-accent"
          />
          <button type="submit" className="bg-ink text-bg p-3 font-sans font-medium uppercase tracking-[0.08em] hover:bg-accent transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-24 px-6 md:px-12">
      <PageFrame number="admin" />
      
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted block mb-4">
              Dashboard
            </span>
            <h1 className="font-editorial font-extralight text-[48px] md:text-[64px] leading-tight tracking-[-0.03em] text-ink">
              Gringa Briefings<span className="text-accent">.</span>
            </h1>
          </div>
          <button 
            onClick={fetchSessions}
            className="font-sans text-[13px] text-ink hover:underline mb-2"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 text-center font-sans italic text-ink-muted">Loading briefings...</div>
        ) : sessions.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-line">
            <p className="font-sans text-ink-muted">No sessions found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="border border-line p-8 flex flex-col md:flex-row gap-8 bg-surface/30 hover:bg-surface/50 transition-colors">
                {/* Left: General Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-2 h-2 rounded-full ${session.completed ? 'bg-green-500' : 'bg-accent animate-pulse'}`} />
                    <span className="font-sans font-semibold text-[14px] text-ink">
                      {session.email}
                    </span>
                    <span className="font-sans italic text-[12px] text-ink-muted">
                      ({session.token})
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-[13px] font-sans text-ink-soft">
                    <p>Created: {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}</p>
                    <p>Flow: <span className="capitalize">{session.gate?.replace('_', ' ') || 'Intro'}</span></p>
                    <p>Progress: Step {session.currentStepIndex + 1}</p>
                  </div>

                  <div className="mt-6">
                    <a 
                      href={`/briefing?token=${session.token}`} 
                      target="_blank" 
                      className="text-[11px] font-medium uppercase tracking-[0.08em] text-accent hover:underline"
                    >
                      View Live Session ↗
                    </a>
                  </div>
                </div>

                {/* Right: Respondents Status */}
                <div className="w-full md:w-[320px] bg-bg/50 border border-line/50 p-6">
                  <span className="font-sans font-medium text-[10px] tracking-[1px] uppercase text-ink-muted block mb-4">
                    Respondents ({session.respondents.length})
                  </span>
                  
                  <div className="flex flex-col gap-4">
                    {session.respondents.length === 0 ? (
                      <p className="font-sans italic text-[12px] text-ink-muted">Solo session</p>
                    ) : (
                      session.respondents.map((r) => (
                        <div key={r.token} className="flex justify-between items-center text-[12px]">
                          <span className="font-sans text-ink truncate mr-2" title={r.email}>
                            {r.email}
                          </span>
                          <span className={`font-sans font-medium uppercase tracking-[0.5px] ${r.individualComplete ? 'text-ink' : 'text-ink-muted'}`}>
                            {r.individualComplete ? '✓ Ready' : 'Pending'}
                          </span>
                        </div>
                      ))
                    )}
                    
                    {session.respondents.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-line/30 flex justify-between items-center font-sans text-[11px] uppercase tracking-[1px]">
                        <span className="text-ink-muted">Together Flow:</span>
                        <span className={session.togetherUnlocked ? 'text-accent font-semibold' : 'text-ink-muted italic'}>
                          {session.togetherUnlocked ? (session.togetherStarted ? 'Active' : 'Unlocked') : 'Locked'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
