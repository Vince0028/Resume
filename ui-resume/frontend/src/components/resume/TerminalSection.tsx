import { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';

interface TerminalSectionProps {
  className?: string;
  isTransition?: boolean;
}

const TerminalSection = ({ className = "", isTransition = false }: TerminalSectionProps) => {
  const [messages, setMessages] = useState<{ handle: string; msg: string; time: string }[]>([]);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const BACKEND = import.meta.env.VITE_BACKEND_URL ?? '';

  useEffect(() => {
    // Basic cache to prevent visual flicker when overlay mounts the component a second time
    const win = window as any;
    if (win._cachedGuestbook) {
      setMessages(win._cachedGuestbook);
    }

    if (!isTransition) { // Don't redundantly fetch in the overlay
      fetch(`${BACKEND}/api/guestbook`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map((item: any) => ({
              handle: item.name,
              msg: item.comment,
              time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            const rev = mapped.reverse();
            win._cachedGuestbook = rev;
            setMessages(rev);
          }
        })
        .catch(err => console.error('Failed to fetch guestbook:', err));
    }
  }, [isTransition]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const sendMessage = async () => {
    if (!handle.trim() || !message.trim()) return;
    if (sending) return;

    setSending(true);
    const payload = { name: handle.trim(), comment: message.trim() };

    try {
      const res = await fetch(`${BACKEND}/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Server error ${res.status}`);
      }

      const saved = await res.json();
      const time = new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { handle: saved.name, msg: saved.comment, time }]);
      setMessage('');
      setToast({ type: 'success', text: 'Message saved to guestbook!' });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setToast({ type: 'error', text: error.message || 'Failed to send. Check your connection.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="terminal" className={`py-24 ${className}`}>
      <div className="px-6 max-w-4xl mx-auto">
        <SectionHeader number="04" title="The Terminal" />
        <ScrollReveal direction="up" delay={0.2}>
          <p className="text-muted-foreground mb-8">
            Leave a digital footprint. Say hello or drop a critique.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3} className="rounded-lg border border-border overflow-hidden relative">
          {/* Toast notification */}
          {toast && (
            <div
              className={`absolute top-3 right-3 z-10 flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono border transition-all ${toast.type === 'success'
                ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
                : 'bg-red-900/80 border-red-500/50 text-red-300'
                }`}
            >
              {toast.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {toast.text}
            </div>
          )}

          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            </div>
            <span className="text-xs font-mono text-muted-foreground ml-2">public_ledger.sh</span>
          </div>

          {/* Terminal body */}
          <div className="bg-terminal p-4 font-mono text-sm min-h-[180px] max-h-[280px] overflow-y-auto">
            <p className="mb-2 text-muted-foreground/60">
              {'>'} system: Welcome. Type a message below to sign the guestbook...
            </p>
            {messages.map((m, i) => (
              <p key={i} className="mb-1">
                <span className="text-terminal-green">{m.handle}</span>
                <span className="text-muted-foreground">@{m.time}</span>
                <span className="text-muted-foreground"> ~ </span>
                <span className="text-foreground">{m.msg}</span>
              </p>
            ))}
            <span className="inline-block w-2 h-4 bg-terminal-green animate-blink" />
          </div>

          {/* Input area */}
          <div className="flex border-t border-border">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your name"
              className="w-28 md:w-36 px-4 py-3 bg-card text-sm font-mono text-foreground placeholder:text-muted-foreground border-r border-border focus:outline-none"
            />
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="type something..."
              className="flex-1 px-4 py-3 bg-card text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className={`px-4 bg-card transition-colors ${sending ? 'text-muted-foreground/40 cursor-wait' : 'text-muted-foreground hover:text-primary'
                }`}
            >
              <Send size={16} />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TerminalSection;
