import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Power, Send, CheckCircle, XCircle, Monitor, Smartphone, Play } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';

const SpaceGame = lazy(() => import('./SpaceGame'));

interface HobbiesSectionProps {
  className?: string;
}

const HobbiesSection = ({ className = "" }: HobbiesSectionProps) => {
  const [pcOn, setPcOn] = useState(false);
  const [messages, setMessages] = useState<{ handle: string; msg: string }[]>([]);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const BACKEND = import.meta.env.VITE_BACKEND_URL ?? '';

  const fetchMessages = useCallback(() => {
    fetch(`${BACKEND}/api/livechat?limit=20`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data.map((item: any) => ({
            handle: item.username,
            msg: item.message
          })).reverse());
        }
      })
      .catch(err => console.error('Failed to fetch chat history', err));
  }, [BACKEND]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

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
    const payload = { username: handle.trim(), message: message.trim() };

    try {
      const res = await fetch(`${BACKEND}/api/livechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Server error ${res.status}`);
      }

      setMessage('');
      fetchMessages();
      setToast({ type: 'success', text: 'Message sent!' });
    } catch (err: any) {
      console.error('Failed to send message', err);
      setToast({ type: 'error', text: err.message || 'Failed to send.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="hobbies" className={`py-24 ${className}`}>
      <div className="px-6 max-w-5xl mx-auto">
        <SectionHeader number="03" title="Hobbies" />

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* ── Desktop PC ── */}
          <ScrollReveal direction="up" delay={0.2}>
            <h3 className="font-mono text-sm text-muted-foreground mb-6 tracking-wide flex items-center gap-2">
              <Monitor size={16} /> Computer Programming
            </h3>

            <div className="flex flex-col items-center">
              {/* Monitor */}
              <div className="relative w-full max-w-sm">
                <div className="bg-muted rounded-lg p-2.5 border-2 border-border">
                  <div className="bg-terminal rounded aspect-[16/10] flex items-center justify-center overflow-hidden relative">
                    {/* Toast notification */}
                    {toast && (
                      <div
                        className={`absolute top-2 right-2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono border transition-all ${toast.type === 'success'
                          ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-900/80 border-red-500/50 text-red-300'
                          }`}
                      >
                        {toast.type === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {toast.text}
                      </div>
                    )}
                    {pcOn ? (
                      <div className="w-full h-full p-3 font-mono text-[11px] leading-relaxed overflow-y-auto">
                        <p className="text-terminal-green">
                          system@desktop ~$ <span className="text-foreground">Welcome. Type below.</span>
                        </p>
                        {messages.map((m, i) => (
                          <p key={i} className="text-terminal-green mt-0.5">
                            <span className="text-primary">{m.handle}</span>
                            <span className="text-muted-foreground">: </span>
                            <span className="text-foreground">{m.msg}</span>
                          </p>
                        ))}
                        <span className="inline-block w-1.5 h-3.5 bg-terminal-green animate-blink mt-0.5" />
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground select-none">
                        <Power size={22} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-mono">Awaiting Input...</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Stand */}
                <div className="mx-auto w-14 h-5 bg-muted border-x-2 border-border" />
                <div className="mx-auto w-24 h-2 bg-muted rounded-b-md border-2 border-t-0 border-border" />
              </div>
              {/* Chat inputs (visible when on) — above keyboard */}
              {pcOn && (
                <div className="mt-4 w-full max-w-sm flex gap-2">
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="your name"
                    className="w-20 px-2 py-1.5 text-xs font-mono bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="type a message..."
                    className="flex-1 px-2 py-1.5 text-xs font-mono bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    className={`px-2 transition-colors ${sending ? 'text-muted-foreground/40 cursor-wait' : 'text-muted-foreground hover:text-primary'
                      }`}
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}

              {/* CPU Tower + Keyboard */}
              <div className="mt-4 flex items-start gap-4 w-full max-w-sm">
                {/* CPU */}
                <div className="w-16 h-24 bg-muted rounded border-2 border-border flex flex-col items-center justify-between py-2.5 shrink-0">
                  <div className="space-y-1.5">
                    <div className="w-8 h-0.5 bg-border rounded" />
                    <div className="w-8 h-0.5 bg-border rounded" />
                  </div>
                  <button
                    onClick={() => setPcOn(!pcOn)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${pcOn
                      ? 'border-terminal-green text-terminal-green'
                      : 'border-border text-muted-foreground'
                      }`}
                    style={pcOn ? { boxShadow: '0 0 8px hsl(var(--terminal-green) / 0.5)' } : undefined}
                  >
                    <Power size={10} />
                  </button>
                </div>

                {/* Keyboard + Mouse Wrapper */}
                <div className="flex-1 flex items-end gap-3 self-end ml-1">
                  {/* Mini Keyboard */}
                  <div className="w-full max-w-[140px] bg-muted rounded border-2 border-border p-1.5 space-y-1">
                    {/* Row 1 — 10 keys */}
                    <div className="flex gap-[2px] justify-center">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="w-[10px] h-[8px] bg-card rounded-[1px] border border-border/60" />
                      ))}
                    </div>
                    {/* Row 2 — 9 keys */}
                    <div className="flex gap-[2px] justify-center">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="w-[10px] h-[8px] bg-card rounded-[1px] border border-border/60" />
                      ))}
                    </div>
                    {/* Row 3 — 8 keys */}
                    <div className="flex gap-[2px] justify-center">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-[10px] h-[8px] bg-card rounded-[1px] border border-border/60" />
                      ))}
                    </div>
                    {/* Spacebar row */}
                    <div className="flex gap-[2px] justify-center">
                      <div className="w-[10px] h-[8px] bg-card rounded-[1px] border border-border/60" />
                      <div className="w-[60px] h-[8px] bg-card rounded-[1px] border border-border/60" />
                      <div className="w-[10px] h-[8px] bg-card rounded-[1px] border border-border/60" />
                    </div>
                  </div>

                  {/* Mouse */}
                  <div className="w-9 h-14 bg-muted border-2 border-border rounded-t-2xl rounded-b-xl relative shrink-0 shadow-sm flex justify-center">
                    <div className="w-[1px] h-4 bg-border/80 mt-2" />
                  </div>
                </div>
              </div>

              {/* Hint to press CPU power button */}
              {!pcOn && (
                <div className="flex items-center justify-center gap-2 mt-3 font-mono text-xs text-muted-foreground/50 animate-pulse">
                  <Power size={12} />
                  <span className="tracking-wider">Press the CPU power button to turn on</span>
                </div>
              )}            </div>
          </ScrollReveal>

          {/* ── Mobile Phone ── */}
          <ScrollReveal direction="up" delay={0.4}>
            <h3 className="font-mono text-sm text-muted-foreground mb-6 tracking-wide flex items-center gap-2">
              <Smartphone size={16} /> Mobile Gaming
            </h3>

            <div className="flex justify-center">
              <div className="w-44 h-[340px] bg-muted rounded-[2rem] border-2 border-border p-2 relative shadow-lg">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-card rounded-b-xl z-10" />

                {/* Screen */}
                <div className="w-full h-full bg-terminal rounded-[1.4rem] overflow-hidden flex flex-col">
                  {/* Game HUD */}
                  <div className="pt-6 px-3 pb-2 flex justify-between items-center">
                    <span className="text-[9px] font-mono text-terminal-green">SCORE: 1250</span>
                    <span className="text-[9px] font-mono text-primary">★★★</span>
                    <span className="text-[9px] font-mono text-terminal-green">HI: 3400</span>
                  </div>

                  {/* Game area */}
                  <div className="flex-1 relative px-3">
                    {/* Enemies */}
                    <div className="grid grid-cols-5 gap-1.5 mb-4">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${[1, 3, 5, 7, 9].includes(i)
                            ? 'bg-primary/80'
                            : 'bg-terminal-green/60'
                            }`}
                          style={{
                            animation: `float ${1.5 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Stars */}
                    {[
                      { top: '40%', left: '20%' },
                      { top: '55%', left: '70%' },
                      { top: '45%', left: '45%' },
                      { top: '65%', left: '15%' },
                      { top: '50%', left: '85%' },
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-0.5 rounded-full bg-foreground/30"
                        style={{ ...pos, animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite` }}
                      />
                    ))}

                    {/* Player ship */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-primary" />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="p-3 flex justify-center gap-8">
                    <div className="w-7 h-7 border border-muted-foreground/30 rounded-full flex items-center justify-center text-muted-foreground text-[10px]">
                      ◀
                    </div>
                    <div className="w-7 h-7 border border-primary/50 rounded-full flex items-center justify-center text-primary text-[10px]">
                      ●
                    </div>
                    <div className="w-7 h-7 border border-muted-foreground/30 rounded-full flex items-center justify-center text-muted-foreground text-[10px]">
                      ▶
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Play button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setGameOpen(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-primary/40 bg-primary/5 hover:bg-primary/15 hover:border-primary/60 text-primary font-mono text-xs tracking-wider transition-all group"
              >
                <Play size={14} className="group-hover:scale-110 transition-transform" />
                <span>Play Game</span>
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Inline keyframes for game animations */}
        <style>{`
          @keyframes float {
            from { transform: translateY(0); }
            to { transform: translateY(3px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>

      {/* Space Game Modal */}
      {gameOpen && (
        <Suspense fallback={null}>
          <SpaceGame onClose={() => setGameOpen(false)} />
        </Suspense>
      )}
    </section >
  );
};

export default HobbiesSection;
