'use client';
import { useCallback, useEffect, useState } from 'react';
import type { FollowUpResult } from '@/lib/basketball-trial-sales/result-types';
import { parentLead } from '@/lib/basketball-trial-sales/leads';
export const followUpApi = '/api/scenarios/04-basketball-trial-sales';
export function useFollowUps(live: boolean) {
  const [results, setResults] = useState<FollowUpResult[]>([]);
  const [activeSession, setSession] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toolsReady, setToolsReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const select = useCallback((id: string) => {
    setSession(id);
    try { localStorage.setItem('parent-follow-up-session', id); } catch { /* Persistence on the server remains authoritative. */ }
  }, []);
  const reload = useCallback(async () => {
    try {
      const response = await fetch(`${followUpApi}/results?lead_id=${parentLead.lead_id}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load saved follow-ups.');
      setResults(previous => JSON.stringify(previous) === JSON.stringify(body.results) ? previous : body.results);
      setToolsReady(body.tools_ready === true);
      setLoadError(null);
    } catch (error) { setLoadError(error instanceof Error ? error.message : 'Could not load saved follow-ups.'); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => {
    try { setSession(localStorage.getItem('parent-follow-up-session')); } catch { /* Server results can still be selected from history. */ }
    void reload();
  }, [reload]);
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => { void reload(); }, 2000);
    return () => clearInterval(timer);
  }, [live, reload]);
  return { results, activeSession, select, reload, loadError, loaded, toolsReady };
}
