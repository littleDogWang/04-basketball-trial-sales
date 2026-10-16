'use client';
// Adapted from agent-ui's Dialog composition; native modal primitives use existing dependencies.
import * as React from 'react';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
type DialogState = { open: boolean; onOpenChange: (open: boolean) => void; titleId: string; descriptionId: string };
const DialogContext = React.createContext<DialogState | null>(null);
function useDialog() { const value = React.useContext(DialogContext); if (!value) throw new Error('Dialog context required'); return value; }
function Dialog({ open, onOpenChange, children }: React.PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void }>) {
  const id = React.useId();
  return <DialogContext.Provider value={{ open, onOpenChange, titleId: `${id}-title`, descriptionId: `${id}-description` }}>{children}</DialogContext.Provider>;
}
function DialogContent({ className, children, showCloseButton = true }: React.PropsWithChildren<{ className?: string; showCloseButton?: boolean }>) {
  const { open, onOpenChange, titleId, descriptionId } = useDialog();
  const ref = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} aria-labelledby={titleId} aria-describedby={descriptionId} data-slot="dialog-content" className={cn('rounded-xl border bg-popover p-6 shadow-lg outline-none', className)} onCancel={event => { event.preventDefault(); onOpenChange(false); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onOpenChange(false); } }}>
    <div className="dialog-content-stack">{children}</div>
    {showCloseButton && <Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label="Close dialog" onClick={() => onOpenChange(false)}><XIcon /></Button>}
  </dialog>;
}
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="dialog-header" className={cn('flex flex-col gap-2 text-left', className)} {...props} />; }
function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) { const { titleId } = useDialog(); return <h2 id={titleId} data-slot="dialog-title" className={cn('text-lg leading-7 font-semibold', className)} {...props} />; }
function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) { const { descriptionId } = useDialog(); return <p id={descriptionId} data-slot="dialog-description" className={cn('text-sm text-muted-foreground', className)} {...props} />; }
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
