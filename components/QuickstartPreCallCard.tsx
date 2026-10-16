'use client';
import { Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { parentLead } from '@/scenarios/07-basketball-trial-sales/leads';
type Props = { open: boolean; onOpenChange: (open: boolean) => void; isLoading: boolean; error: string | null; enabled: boolean; toolsReady: boolean; onStartConversation: () => void };
export function QuickstartPreCallCard({ open, onOpenChange, isLoading, error, enabled, toolsReady, onStartConversation }: Props) {
  return <Dialog open={open} onOpenChange={value => { if (!isLoading) onOpenChange(value); }}>
    <DialogContent className="trial-dialog" showCloseButton={!isLoading}>
      <DialogHeader><Badge variant="outline">SCENARIO 07 · PARENT FOLLOW-UP</Badge><DialogTitle className="trial-dialog-title">Turn an inquiry into<br />a first step on court.</DialogTitle><DialogDescription>Follow up with a parent who asked about a basketball trial. Understand their needs, find a suitable class, and discuss the next step.</DialogDescription></DialogHeader>
      <div className="dialog-lead"><span className="eyebrow">YOU ARE THE PARENT</span><h3>{parentLead.parent_name}</h3><p>Your child is {parentLead.child_age}. You asked about a beginner trial through the academy website. Tell Riley what you’re looking for and when you’re available.</p></div>
      <Button onClick={onStartConversation} disabled={isLoading || !enabled} className="w-full" aria-label={isLoading ? 'Connecting to the parent follow-up advisor' : 'Start parent follow-up'}>{isLoading ? <Loader2 className="animate-spin" /> : <Mic />}{isLoading ? 'Connecting to Riley…' : 'Start parent follow-up'}</Button>
      {!enabled && <p className="small-note" role="status">Preparing the follow-up. Resolve any loading or saving error before starting.</p>}
      {error && <p role="alert" className="error-message">{error}</p>}
      <p className="small-note">Enable your microphone. This practice uses a fictional inquiry and fixed trial times. {toolsReady ? 'Connected tools can save a request; the academy must still confirm it.' : 'You can discuss courses and preferences. Answers and trial requests cannot be saved during this call.'}</p>
    </DialogContent>
  </Dialog>;
}
