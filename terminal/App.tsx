import React, { useState, useEffect, useRef } from 'react';
import { TerminalLine, MessageType } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { INITIAL_BOOT_SEQUENCE, THEME_BORDER, THEME_COLOR, THEME_GLOW, THEME_BG, RESUME_DATA, RESUME_FALLBACK_URLS } from './constants';
import TerminalInput from './components/TerminalInput';
import SystemMonitor from './components/SystemMonitor';
import FileExplorer from './components/FileExplorer';
import ClockPanel from './components/ClockPanel';
import VirtualKeyboard from './components/VirtualKeyboard';

const TrafficGraph = () => {
  const [bars, setBars] = useState<number[]>(new Array(10).fill(20));

  useEffect(() => {
    // slow down the traffic update a bit for a smoother, less frantic look
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.max(10, Math.floor(Math.random() * 90))));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-end gap-1 pb-4">
      {bars.map((h, i) => (
        <div 
          key={i} 
          style={{ height: `${h}%` }} 
          className="flex-1 bg-indigo-500/30 border-t border-indigo-500 transition-all duration-300 ease-in-out shadow-[0_0_5px_rgba(99,102,241,0.3)]"
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [networkLevel, setNetworkLevel] = useState(60);

  // Auto-scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isBooting]);

  // Boot sequence effect
  useEffect(() => {
    let delay = 0;
    INITIAL_BOOT_SEQUENCE.forEach((line, index) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setHistory(prev => [...prev, { id: `boot-${index}`, type: MessageType.INFO, content: line, timestamp: Date.now() }]);
        if (index === INITIAL_BOOT_SEQUENCE.length - 1) setIsBooting(false);
      }, delay);
    });
  }, []);

  // Simulate network level for the Network Status widget
  useEffect(() => {
    const iv = setInterval(() => {
      setNetworkLevel(prev => {
        // gently vary network level more slowly and with smaller changes
        const delta = Math.floor(Math.random() * 9) - 4; // -4..4
        let next = Math.max(5, Math.min(100, prev + delta));
        return next;
      });
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  const handleCommand = async (cmd: string) => {
    const userLine: TerminalLine = { id: `user-${Date.now()}`, type: MessageType.USER, content: cmd, timestamp: Date.now() };
    setHistory(prev => [...prev, userLine]);
    setIsProcessing(true);

    const lowerCmd = cmd.toLowerCase().trim();

    // Local commands
    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'help') {
      const helpText = `\nAVAILABLE COMMANDS:\n-------------------\nHELP               - Show this message\nCLEAR              - Clear terminal buffer\nABOUT              - Display user summary\nPROJECTS           - List portfolio projects\nCONTACT            - Show contact channels\nPRIVACY            - View Privacy Policy\nOPEN GUI           - Open graphical resume (same tab)\nOPEN RESUME        - Open graphical resume (same tab)\nSET RESUME-URL <u> - Set resume URL used by OPEN GUI\nCAT <file>         - Display file contents\nOPEN <file>        - Open or display file\n[QUERY]            - Ask the AI system anything about the user\n`;
      setHistory(prev => [...prev, { id: `sys-${Date.now()}`, type: MessageType.SYSTEM, content: helpText, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'privacy') {
      setPrivacyOpen(true);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'open gui' || lowerCmd === 'open resume') {
      // Use user-configured resume URL if present
      const userUrl = localStorage.getItem('resumeUrl');
      const candidate = userUrl && userUrl.trim() ? userUrl.trim() : (RESUME_FALLBACK_URLS && RESUME_FALLBACK_URLS.length ? RESUME_FALLBACK_URLS[0] : '../index.html');
      setHistory(prev => [...prev, { id:`open-${Date.now()}`, type: MessageType.INFO, content: `Redirecting to ${candidate} ...`, timestamp: Date.now() }]);
      window.location.href = candidate;
      return;
    }

    if (lowerCmd.startsWith('set resume-url')) {
      const parts = cmd.split(/\s+/);
      const url = parts.slice(2).join(' ').trim();
      if (!url) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: 'set resume-url: missing URL', timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }
      try {
        localStorage.setItem('resumeUrl', url);
        setHistory(prev => [...prev, { id:`set-${Date.now()}`, type: MessageType.SUCCESS, content: `resume URL saved: ${url}`, timestamp: Date.now() }]);
      } catch (e) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `set resume-url: failed to save`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'about') {
      const lines = RESUME_DATA.split('\n').map(l => l.trim()).filter(Boolean);
      const aboutLines = lines.slice(0, 10).join('\n');
      setHistory(prev => [...prev, { id:`about-${Date.now()}`, type: MessageType.SYSTEM, content: aboutLines, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'projects') {
      const projSection = (RESUME_DATA.split('PROJECTS:')[1] || '').split('\n').map(l => l.trim()).filter(Boolean);
      const projLines = projSection.slice(0, 12).join('\n');
      setHistory(prev => [...prev, { id:`proj-${Date.now()}`, type: MessageType.SYSTEM, content: projLines || 'No projects found', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'contact') {
      // Provide clickable links (rendered as HTML)
      const html = `
        <div>
          <div>Email: <a href="mailto:alobinvince@gmail.com">alobinvince@gmail.com</a></div>
          <div>GitHub: <a href="https://github.com/Vince0028" target="_blank" rel="noreferrer">github.com/Vince0028</a></div>
          <div>LinkedIn: <a href="https://linkedin.com" target="_blank" rel="noreferrer">linkedin.com</a></div>
          <div>Website: <a href="/index.html?resume=1">Portfolio (open)</a></div>
        </div>
      `;
      setHistory(prev => [...prev, { id:`contact-${Date.now()}`, type: MessageType.SYSTEM, content: html, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    // open <file>
    if (lowerCmd.startsWith('open ')) {
      const target = cmd.slice(5).trim();
      if (!target) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: 'open: missing target', timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }
      if (target === 'index.html' || target === 'resume' || target === 'gui') {
        window.location.href = '/index.html';
        return;
      }
      try {
        const res = await fetch('/' + target);
        if (!res.ok) {
          setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `open: cannot open ${target} (${res.status})`, timestamp: Date.now() }]);
          setIsProcessing(false);
          return;
        }
        const text = await res.text();
        setHistory(prev => [...prev, { id:`file-${Date.now()}`, type: MessageType.SYSTEM, content: `----- ${target} -----\n${text}\n----- end -----`, timestamp: Date.now() }]);
      } catch (err) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `open: error reading ${target}`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    // cat <file>
    if (lowerCmd.startsWith('cat ')) {
      const target = cmd.slice(4).trim();
      if (!target) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: 'cat: missing file', timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }
      try {
        const res = await fetch('/' + target);
        if (!res.ok) {
          setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `cat: cannot read ${target} (${res.status})`, timestamp: Date.now() }]);
          setIsProcessing(false);
          return;
        }
        const text = await res.text();
        setHistory(prev => [...prev, { id:`cat-${Date.now()}`, type: MessageType.SYSTEM, content: `----- ${target} -----\n${text}\n----- end -----`, timestamp: Date.now() }]);
      } catch (err) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `cat: error reading ${target}`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    // AI Command (fallback)
    try {
      const response = await sendMessageToGemini(cmd);
      setHistory(prev => [...prev, { id: `ai-${Date.now()}`, type: MessageType.SYSTEM, content: response, timestamp: Date.now() }]);
    } catch (err) {
      setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: 'SYSTEM ERROR: AI unavailable', timestamp: Date.now() }]);
    }
    setIsProcessing(false);
  };

  // Listen for FileExplorer open-file events
  useEffect(() => {
    const handler = async (e: any) => {
      const filename = e?.detail?.filename;
      if (!filename) return;
      if (filename === 'index.html') { window.location.href = '/index.html'; return; }
      try {
        const res = await fetch('/' + filename);
        if (!res.ok) { setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `open: cannot open ${filename} (${res.status})`, timestamp: Date.now() }]); return; }
        const text = await res.text();
        setHistory(prev => [...prev, { id:`file-${Date.now()}`, type: MessageType.SYSTEM, content: `----- ${filename} -----\n${text}\n----- end -----`, timestamp: Date.now() }]);
      } catch (err) {
        setHistory(prev => [...prev, { id:`err-${Date.now()}`, type: MessageType.ERROR, content: `open: error reading ${filename}`, timestamp: Date.now() }]);
      }
    };
    window.addEventListener('terminal-open-file', handler as EventListener);
    return () => window.removeEventListener('terminal-open-file', handler as EventListener);
  }, []);

  // helper to render terminal content as text or HTML when needed
  const renderLineContent = (line: TerminalLine) => {
    const content = line.content || '';
    // small helper to unescape common HTML entities if the content was escaped
    const unescapeHtml = (str: string) => {
      return str.replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
    };

    // simple heuristic: if content contains an anchor tag or html block (or escaped html), render as HTML
    const looksLikeHtml = /<a\s|<div|<span|<br|<strong|<em|&lt;\/?div|&lt;a\s/.test(content);
    if (looksLikeHtml) {
      const html = looksLikeHtml && content.indexOf('&lt;') !== -1 ? unescapeHtml(content) : content;
      return <div className={THEME_COLOR} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    // otherwise render preserving newlines
    return <div className={THEME_COLOR}>{content}</div>;
  };

  return (
    <div className="w-screen h-screen p-2 md:p-6 flex items-center justify-center bg-black overflow-hidden relative">
        {/* Background Network Mesh (Simulated) */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `radial-gradient(${THEME_COLOR.replace('text-', '')} 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
        }}></div>

        <div className={`relative z-10 w-full max-w-[1600px] h-full md:h-[90vh] flex flex-col md:grid md:grid-cols-12 md:grid-rows-12 gap-4 ${THEME_COLOR}`}>
            
            {/* TOP BAR / CLOCK */}
            <div className={`col-span-12 row-span-2 border ${THEME_BORDER} ${THEME_BG} ${THEME_GLOW} relative p-4 flex items-center`}>
                <div className="absolute top-0 left-0 bg-indigo-500 text-black text-xs px-2 font-bold">SYSTEM</div>
                <div className="absolute top-0 right-0 px-2 flex space-x-2 text-xs border-l border-b border-indigo-500/30">
                     <span>NET: ONLINE</span>
                     <span>SEC: HIGH</span>
                </div>
                <ClockPanel />
            </div>

            {/* LEFT SIDEBAR (STATS) */}
            <div className={`hidden md:flex col-span-3 row-span-7 flex-col gap-4 overflow-hidden`}>
                 <div className={`flex-1 min-h-0 border ${THEME_BORDER} ${THEME_BG} p-4 relative flex flex-col`}>
                    <div className="absolute top-0 left-0 text-[10px] bg-indigo-900/40 px-1">HARDWARE MONITOR</div>
                    <SystemMonitor />
                 </div>
                 {/* Clipboard Access - Responsive Height */}
                 <div className={`shrink-0 border ${THEME_BORDER} ${THEME_BG} p-3 flex flex-col justify-center`}>
                    <div className="text-[10px] mb-2 uppercase tracking-wider opacity-80">Clipboard Access</div>
                    <div className="flex gap-2">
                         <button className={`flex-1 border ${THEME_BORDER} bg-indigo-900/10 hover:bg-indigo-500 hover:text-black transition-colors text-xs py-2 uppercase tracking-widest font-bold`}>Copy</button>
                         <button className={`flex-1 border ${THEME_BORDER} bg-indigo-900/10 hover:bg-indigo-500 hover:text-black transition-colors text-xs py-2 uppercase tracking-widest font-bold`}>Paste</button>
                    </div>
                 </div>
            </div>

            {/* MAIN TERMINAL */}
            <div className={`col-span-12 md:col-span-6 row-span-7 border ${THEME_BORDER} bg-black/80 ${THEME_GLOW} p-4 flex flex-col relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-6 bg-indigo-900/20 border-b border-indigo-500/30 flex items-center px-2">
                    <span className="text-xs font-bold">MAIN - bash</span>
                </div>
                <div className="flex-1 overflow-y-auto mt-6 font-mono text-sm md:text-base leading-relaxed p-2">
                    {history.map((line) => (
                      <div key={line.id} className="mb-2 break-words whitespace-pre-wrap">
                        {line.type === MessageType.USER && (
                          <div className="text-indigo-300 opacity-90">{`> ${line.content}`}</div>
                        )}
                        {(line.type === MessageType.SYSTEM || line.type === MessageType.INFO) && (
                          renderLineContent(line)
                        )}
                      </div>
                    ))}
                    {isProcessing && <div className="animate-pulse">_ PROCESSING...</div>}
                    <div ref={terminalEndRef} />
                </div>
                {!isBooting && <TerminalInput onSubmit={handleCommand} disabled={isProcessing} />}
            </div>

            {/* RIGHT SIDEBAR (Network/Info) */}
            <div className={`hidden md:flex col-span-3 row-span-7 border ${THEME_BORDER} ${THEME_BG} p-4 relative flex-col`}>
                 <div className="absolute top-0 right-0 text-[10px] bg-indigo-900/40 px-1">NETWORK STATUS</div>
                 <div className="flex-1 flex items-center justify-center opacity-90">
                     {/* Dynamic Network Indicator (SVG) */}
                     <div className="w-40 h-40 md:w-48 md:h-48 relative">
                       <svg viewBox="0 0 100 100" className="w-full h-full">
                         <defs>
                           <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                             <stop offset="0%" stopColor="#fff9ef" stopOpacity="1" />
                             <stop offset="35%" stopColor="#ffd59e" stopOpacity="1" />
                             <stop offset="100%" stopColor="#ff7a4d" stopOpacity="1" />
                           </radialGradient>
                           <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#7fb3ff" />
                             <stop offset="100%" stopColor="#caa5ff" />
                           </linearGradient>
                           <filter id="sunGlow" x="-60%" y="-60%" width="220%" height="220%">
                             <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                             <feMerge>
                               <feMergeNode in="coloredBlur" />
                               <feMergeNode in="SourceGraphic" />
                             </feMerge>
                           </filter>
                          {/* decorative rectangular holder to match card (no circular clipping) */}
                          
                        </defs>

                        {/* background frame and faint orbit paths (fill card) */}
                        <rect x="2" y="2" width="96" height="96" rx="8" fill="none" stroke="#07101a" strokeWidth="1" strokeOpacity="0.08" />
                        <g>
                         {[22, 32, 40, 46].map((r, i) => (
                          <circle key={`orbit-${i}`} cx="50" cy="50" r={r} fill="none" stroke="#081020" strokeWidth="0.6" strokeOpacity="0.18" strokeDasharray={i%2?"3 7":"4 6"} />
                         ))}

                         {/* single larger glowing central sun (bigger) */}
                         <circle cx="50" cy="50" r="18" fill="url(#sunGrad)" filter="url(#sunGlow)" />
                         <circle cx="50" cy="50" r="20" fill="url(#sunGrad)" filter="url(#sunGlow)" />

                         {/* orbiting nodes (with optional moons) */}
                         {
                           [
                             { r: 22, size: 4.2, dur: 6.5, angle: 10, moon: { dist: 6, size: 0.9, dur: 2.2 } },
                             { r: 22, size: 2.8, dur: 8.2, angle: 100 },
                             { r: 30, size: 3.6, dur: 7.2, angle: 45, moon: { dist: 5, size: 0.8, dur: 2.8 } },
                             { r: 30, size: 1.8, dur: 9.8, angle: 210 },
                             { r: 36, size: 3.8, dur: 11.2, angle: 180 },
                             { r: 36, size: 1.6, dur: 13.6, angle: 270 },
                             { r: 44, size: 5.2, dur: 11.9, angle: 60, moon: { dist: 8, size: 1.2, dur: 3.6 } },
                             { r: 44, size: 2.8, dur: 15.0, angle: 300 },
                             { r: 40, size: 3.6, dur: 13.6, angle: 30 },
                             { r: 40, size: 1.9, dur: 16.4, angle: 150 },
                             { r: 28, size: 2.0, dur: 10.1, angle: 330 },
                             { r: 32, size: 2.8, dur: 9.6, angle: 120 },
                             { r: 42, size: 3.2, dur: 14.0, angle: 250 },
                             { r: 26, size: 1.6, dur: 11.5, angle: 320 }
                           ].map((o, i) => (
                             <g key={`orb-${i}`} transform={`rotate(${o.angle} 50 50)`}> 
                               <g transform={`translate(${50 + o.r} 50)`}> 
                                 <circle cx={0} cy={0} r={o.size} fill="url(#orbGrad)" opacity="1" />
                                 {o.size > 2.6 && (
                                   <circle cx={0} cy={0} r={o.size * 2.4} fill="url(#orbGrad)" opacity={0.12} />
                                 )}
                                 {o.moon && (
                                   <g>
                                     <g>
                                       <animateTransform attributeName="transform" attributeType="XML" type="rotate" from={`0 0 0`} to={`360 0 0`} dur={`${o.moon.dur}s`} repeatCount="indefinite" />
                                       <circle cx={o.moon.dist} cy={0} r={o.moon.size} fill="#ffffff" opacity="0.95" />
                                     </g>
                                   </g>
                                 )}
                               </g>
                               <animateTransform attributeName="transform" attributeType="XML" type="rotate" from={`${o.angle} 50 50`} to={`${o.angle + 360} 50 50`} dur={`${o.dur}s`} repeatCount="indefinite" />
                             </g>
                           ))
                         }
                        </g>
                        {/* subtle rectangular decorative frame (top) to match card */}
                        <rect x="3" y="3" width="94" height="94" rx="8" fill="none" stroke="#0b1220" strokeWidth="1" strokeOpacity="0.22" />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="text-lg md:text-2xl font-mono font-bold text-white bg-black/45 px-3 py-1 rounded-md border border-indigo-600/20">{networkLevel}%</div>
                       </div>
                     </div>
                 </div>
                 <div className="h-40 shrink-0 border-t border-indigo-500/30 pt-2">
                    <div className="text-[10px] mb-1">TRAFFIC ANALYSIS</div>
                    <TrafficGraph />
                 </div>
            </div>

            {/* BOTTOM PANELS */}
            <div className={`col-span-12 md:col-span-5 row-span-3 border ${THEME_BORDER} ${THEME_BG} p-4`}>
                 <FileExplorer />
            </div>

            <div className={`hidden md:flex col-span-7 row-span-3 border ${THEME_BORDER} ${THEME_BG} p-4 items-center justify-center overflow-hidden`}>
                 <VirtualKeyboard />
            </div>

        </div>

        {/* PRIVACY MODAL */}
        {privacyOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className={`w-full max-w-lg border-2 ${THEME_BORDER} bg-black p-8 relative ${THEME_GLOW}`}>
                    <h2 className="text-2xl font-bold mb-4">PRIVACY_POLICY.TXT</h2>
                    <p className="text-sm mb-4 leading-relaxed opacity-80">
                        This terminal does not collect personal data. All commands entered are processed locally or sent anonymously to the AI core for response generation. 
                        <br/><br/>
                        Cookies are only used for session persistence. No tracking pixels detected.
                        <br/><br/>
                        System Integrity: SECURE.
                    </p>
                    <button 
                        onClick={() => setPrivacyOpen(false)}
                        className={`border ${THEME_BORDER} hover:bg-indigo-500 hover:text-black px-6 py-2 transition-all uppercase font-bold`}
                    >
                        ACKNOWLEDGE
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;