'use client';

import { useState, useRef, Suspense, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FollowUpResultPanel } from './FollowUpResultPanel';
import { parentLead } from '@/scenarios/07-basketball-trial-sales/leads';
import { outcomeLabels } from '@/scenarios/07-basketball-trial-sales/result-types';
import { followUpApi, useFollowUps } from '@/hooks/use-follow-ups';
import type { RTMClient } from 'agora-rtm';
import type {
  AgoraTokenData,
  ClientStartRequest,
  AgentResponse,
  AgoraRenewalTokens,
} from '../types/conversation';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSkeleton } from './LoadingSkeleton';
import { QuickstartPreCallCard } from './QuickstartPreCallCard';

// Dynamically import the ConversationComponent with ssr disabled
const ConversationComponent = dynamic(() => import('./ConversationComponent'), {
  ssr: false,
});

// Dynamically import AgoraRTCProvider (browser-only).
// The AgoraVoiceAI toolkit is initialized inside ConversationComponent after
// the RTC join succeeds, so this wrapper only needs to provide the RTC client.
const AgoraProvider = dynamic(
  async () => {
    const { AgoraRTCProvider, default: AgoraRTC } =
      await import('agora-rtc-react');
    return {
      default: function AgoraProviders({
        children,
      }: {
        children: React.ReactNode;
      }) {
        // useRef persists across StrictMode's simulated unmount/remount, so only
        // one RTC client is ever created per session (useMemo creates two in StrictMode).
        const clientRef = useRef<ReturnType<
          typeof AgoraRTC.createClient
        > | null>(null);
        if (!clientRef.current) {
          clientRef.current = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8',
          });
        }
        return (
          <AgoraRTCProvider client={clientRef.current}>
            {children}
          </AgoraRTCProvider>
        );
      },
    };
  },
  { ssr: false },
);

export default function LandingPage() {
  const [showConversation, setShowConversation] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const followUps = useFollowUps(showConversation);
  const pendingSession = useRef<string | null>(null);
  const [finalizeFailed, setFinalizeFailed] = useState(false);

  // Preload heavy modules on mount so they're already cached when the user
  // clicks "Try it Now" — eliminates the ~1.8s dynamic-import delay.
  useEffect(() => {
    import('agora-rtc-react').catch(() => {});
    import('agora-rtm').catch(() => {});
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agoraData, setAgoraData] = useState<AgoraTokenData | null>(null);
  const [rtmClient, setRtmClient] = useState<RTMClient | null>(null);

  const handleStartConversation = async () => {
    setIsLoading(true);
    setError(null);


    try {
      if (!pendingSession.current) {
        const response = await fetch(`${followUpApi}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: parentLead.lead_id }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        pendingSession.current = body.result.session_id;
        followUps.select(body.result.session_id);
        await followUps.reload();
      }
      // 1. Fetch RTC token + channel
      // console.log('Fetching Agora token...');
      const agoraResponse = await fetch('/api/generate-agora-token');
      const responseData = await agoraResponse.json();
      // console.log('Agora token response: uid =', responseData.uid, 'channel =', responseData.channel);

      if (!agoraResponse.ok) {
        throw new Error(
          `Failed to generate Agora token: ${JSON.stringify(responseData)}`,
        );
      }

      // 2. Run agent invite and RTM setup in parallel — both only need the token response.
      //    RTM must be ready before ConversationComponent mounts so AgoraVoiceAI
      //    can subscribe immediately. Agent invite is non-fatal.
      const setup = await Promise.allSettled([
        // 2a. Start the AI agent
        fetch('/api/invite-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requester_id: responseData.uid,
            channel_name: responseData.channel,
            session_id: pendingSession.current!,
          } as ClientStartRequest),
        })
          .then(async (res) => {
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Could not connect to the follow-up advisor.');
            return body as AgentResponse;
          }),

        // 2b. Set up RTM (dynamically imported to keep it client-only)
        (async () => {
          const { default: AgoraRTM } = await import('agora-rtm');
          const rtm: RTMClient = new AgoraRTM.RTM(
            process.env.NEXT_PUBLIC_AGORA_APP_ID!,
            responseData.uid,
          );
          await rtm.login({ token: responseData.token });
          await rtm.subscribe(responseData.channel);
          // console.log('RTM ready, channel:', responseData.channel);
          return rtm;
        })(),
      ]);

      if (setup[0].status === 'rejected' || setup[1].status === 'rejected') {
        if (setup[1].status === 'fulfilled') await setup[1].value.logout().catch(() => {});
        if (setup[0].status === 'fulfilled') await fetch('/api/stop-conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent_id: setup[0].value.agent_id }) });
        throw setup[0].status === 'rejected' ? setup[0].reason : setup[1].status === 'rejected' ? setup[1].reason : new Error('Connection failed');
      }
      const agentData = setup[0].value;
      const rtm = setup[1].value;
      setDialogOpen(false);
      // 3. All dependencies ready — store state and show conversation
      setRtmClient(rtm);
      setAgoraData({ ...responseData, agentId: agentData?.agent_id });
      setShowConversation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start parent follow-up. Please retry.');
      console.error('Error starting conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenWillExpire = useCallback(
    async (uid: string): Promise<AgoraRenewalTokens> => {
      try {
        const channel = agoraData?.channel;
        if (!channel) {
          throw new Error('Missing channel for token renewal');
        }

        // RTC and RTM tokens are renewed independently:
        //   - RTC uses the browser client's assigned UID (passed in from ConversationComponent).
        //   - RTM uses the same UID that was used during RTM login (agoraData.uid).
        // Both are fetched in parallel to stay within the token-expiry grace-period window.
        const [rtcResponse, rtmResponse] = await Promise.all([
          fetch(`/api/generate-agora-token?channel=${channel}&uid=${uid}`),
          fetch(`/api/generate-agora-token?channel=${channel}&uid=${agoraData.uid}`),
        ]);
        const [rtcData, rtmData] = await Promise.all([
          rtcResponse.json(),
          rtmResponse.json(),
        ]);

        if (!rtcResponse.ok || !rtmResponse.ok) {
          throw new Error('Failed to generate renewal tokens');
        }

        return {
          rtcToken: rtcData.token,
          rtmToken: rtmData.token,
        };
      } catch (error) {
        console.error('Error renewing token:', error);
        throw error;
      }
    },
    [agoraData],
  );

  const finalizeResult = async () => {
    const id = pendingSession.current || followUps.activeSession;
    if (!id) return;
    try {
      const response = await fetch(`${followUpApi}/sessions/${id}`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setFinalizeFailed(false);
      pendingSession.current = null;
      await followUps.reload();
    } catch (error) {
      setFinalizeFailed(true);
      setError(error instanceof Error ? error.message : 'Could not finalize this follow-up. Retry saving.');
    }
  };

  const handleEndConversation = async () => {
    // Stop the AI agent
    if (agoraData?.agentId) {
      try {
        // console.log('Stopping agent:', agoraData.agentId);
        const response = await fetch('/api/stop-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: agoraData.agentId }),
        });
        if (!response.ok) {
          console.error('Failed to stop agent:', await response.text());
        }
        // else console.log('Agent stopped successfully');
      } catch (error) {
        console.error('Error stopping agent:', error);
      }
    }

    // Tear down RTM — owned here since we created it here
    rtmClient?.logout().catch((err) => console.error('RTM logout error:', err));
    setRtmClient(null);
    setShowConversation(false);
    await finalizeResult();
  };

  const selectedResult = followUps.results.find(result => result.session_id === followUps.activeSession);
  return <div className="trial-workspace">
    <header className="trial-header"><div className="trial-brand"><Image src="/agora-logo-mark.svg" alt="Agora" width={32} height={32} /><div><div className="trial-title-row"><h1>Parent trial follow-up</h1><Badge variant="outline">07</Badge></div><p>Existing inquiry → qualified interest → trial request</p></div></div><Badge variant="secondary">{showConversation ? 'Follow-up in progress' : 'Northside Basketball Academy'}</Badge></header>
    <main className="trial-main">
      {!showConversation && <div className="workspace-intro"><div><span className="eyebrow">EVERY INQUIRY DESERVES A NEXT STEP</span><h2>From interest to a trial request.</h2><p>Speak with Riley as a parent. Discuss the family’s needs, decision, and next step. Connected tools can save the agreed outcome.</p></div><Button onClick={() => setDialogOpen(true)} disabled={finalizeFailed}>Start parent follow-up</Button></div>}
      {(error || followUps.loadError) && <div role="alert" className="workspace-error"><p>{error || followUps.loadError}</p><Button variant="outline" onClick={() => { if (finalizeFailed) { setError(null); void finalizeResult(); } else { void followUps.reload(); } }}>{finalizeFailed ? 'Retry saving this follow-up' : 'Reload saved results'}</Button></div>}
      {showConversation && agoraData && rtmClient && <div className="trial-call"><Suspense fallback={<LoadingSkeleton />}><ErrorBoundary><AgoraProvider><ConversationComponent agoraData={agoraData} rtmClient={rtmClient} onTokenWillExpire={handleTokenWillExpire} onEndConversation={handleEndConversation} /></AgoraProvider></ErrorBoundary></Suspense></div>}
      <div className="trial-grid"><aside className="follow-up-card lead-card"><span className="eyebrow">EXISTING PARENT INQUIRY</span><div className="parent-avatar">AM</div><h2>{parentLead.parent_name}</h2><p>{parentLead.contact}</p><Badge variant="secondary">{parentLead.lead_id}</Badge><dl className="result-fields"><div><dt>Source</dt><dd>{parentLead.source}</dd></div><div><dt>Interested in</dt><dd>{parentLead.interest}</dd></div><div><dt>Child’s age</dt><dd>{parentLead.child_age} years</dd></div></dl><div className="next-action"><span className="eyebrow">THE GOAL</span><p>Check interest, find a suitable trial, and discuss what happens next.</p></div><p className="small-note">Fictional inquiry for this experience. Previously supplied details do not need to be asked again.</p></aside><FollowUpResultPanel result={selectedResult} /></div>
      <section className="history-section"><div className="result-heading"><div><span className="eyebrow">COURSE ADVISOR VIEW</span><h2>Saved follow-ups</h2></div><Button size="sm" variant="outline" onClick={() => { void followUps.reload(); }}>Refresh results</Button></div><p className="small-note">Open a record to review the family’s needs and next step. Records remain available after reloading.</p>{!followUps.loaded ? <p role="status">Loading saved follow-ups…</p> : followUps.results.length === 0 ? <div className="history-empty">No saved follow-ups yet.</div> : <div className="history-list">{followUps.results.map(result => <button key={result.session_id} type="button" disabled={showConversation} aria-pressed={followUps.activeSession === result.session_id} className="history-item" onClick={() => followUps.select(result.session_id)}><div><strong>{outcomeLabels[result.outcome]}</strong><p>{result.summary}</p></div><span>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' }).format(new Date(result.created_at))} · Shanghai</span></button>)}</div>}</section>
    </main>
    <footer className="trial-footer">Powered by Agora · Trial requests require advisor confirmation.</footer>
    <QuickstartPreCallCard open={dialogOpen && !showConversation} onOpenChange={setDialogOpen} isLoading={isLoading} error={error} enabled={followUps.loaded && !followUps.loadError && !finalizeFailed} toolsReady={followUps.toolsReady} onStartConversation={handleStartConversation} />
  </div>;
}
