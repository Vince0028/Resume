import React, { useState, useEffect, useRef } from 'react';
import { TerminalLine, MessageType } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { INITIAL_BOOT_SEQUENCE, THEME_BORDER, THEME_COLOR, THEME_GLOW, THEME_BG, RESUME_DATA, RESUME_FALLBACK_URLS, FILE_SYSTEM, FileSystemNode } from './constants';
import TerminalInput from './components/TerminalInput';
import SystemMonitor from './components/SystemMonitor';
import FileExplorer from './components/FileExplorer';
import ClockPanel from './components/ClockPanel';
import VirtualKeyboard from './components/VirtualKeyboard';
import OctahedronNetwork from './components/OctahedronNetwork';
import FingerprintScanner from './components/FingerprintScanner';
import MatrixRain from './components/MatrixRain';
import Flicker from './components/Flicker';
import MemoryBlock from './components/MemoryBlock';

const findNode = (name: string, nodes: FileSystemNode[] = FILE_SYSTEM): FileSystemNode | null => {
  for (const node of nodes) {
    if (node.name === name) return node;
    if (node.children) {
      const found = findNode(name, node.children);
      if (found) return found;
    }
  }
  return null;
};

const generateTree = (nodes: FileSystemNode[], prefix = ''): string => {
  let output = '';
  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    output += `${prefix}${connector}${node.name}${node.type === 'dir' ? '/' : ''}\n`;
    if (node.children) {
      output += generateTree(node.children, prefix + (isLast ? '    ' : '│   '));
    }
  });
  return output;
};

const TrafficGraph = () => {
  const [bars, setBars] = useState<number[]>(new Array(10).fill(20));

  useEffect(() => {
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
  const [privacyOpen, setPrivacyOpen] = useState(true);
  const [networkLevel, setNetworkLevel] = useState(60);

  // Verification State
  const [isFingerprintVerified, setIsFingerprintVerified] = useState(false);
  const [isSignatureVerified, setIsSignatureVerified] = useState(false);

  // Signature Pad State
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleScanComplete = () => {
    setIsFingerprintVerified(true);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = '#6366f1'; // Indigo-500
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setIsSignatureVerified(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.closePath();
    }
  };

  const clearSignature = () => {
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSignatureVerified(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const handleAcknowledge = () => {
    setPrivacyOpen(false);
    setHistory([]);
    setIsBooting(true);
    setNetworkLevel(60);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isBooting]);

  useEffect(() => {
    if (isBooting) {
      let delay = 0;
      INITIAL_BOOT_SEQUENCE.forEach((line, index) => {
        delay += Math.random() * 300 + 100;
        setTimeout(() => {
          setHistory(prev => [...prev, { id: `boot-${index}-${Date.now()}`, type: MessageType.INFO, content: line, timestamp: Date.now() }]);
          if (index === INITIAL_BOOT_SEQUENCE.length - 1) setIsBooting(false);
        }, delay);
      });
    }
  }, [isBooting]);

  useEffect(() => {
    const iv = setInterval(() => {
      setNetworkLevel(prev => {
        const delta = Math.floor(Math.random() * 9) - 4;
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

    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'help') {
      const helpText = `\nAVAILABLE COMMANDS:\n-------------------\nHELP               - Show this message\nCLEAR              - Clear terminal buffer\nABOUT              - Display user summary\nPROJECTS           - List portfolio projects\nCONTACT            - Show contact channels\nPRIVACY            - View Privacy Policy\nOPEN GUI           - Open graphical resume (same tab)\nOPEN RESUME        - Open graphical resume (same tab)\nSET RESUME-URL <u> - Set resume URL used by OPEN GUI\nCAT <file>         - Display file contents\nOPEN <file>        - Open or display file\nTREE               - Show file system structure\n`;
      setHistory(prev => [...prev, { id: `sys-${Date.now()}`, type: MessageType.SYSTEM, content: helpText, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'file tree' || lowerCmd === 'tree') {
      const treeStr = generateTree(FILE_SYSTEM);
      setHistory(prev => [...prev, { id: `tree-${Date.now()}`, type: MessageType.CODE, content: treeStr, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'privacy') {
      setPrivacyOpen(true);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'open gui' || lowerCmd === 'open resume') {
      const userUrl = localStorage.getItem('resumeUrl');
      const candidate = userUrl && userUrl.trim() ? userUrl.trim() : (RESUME_FALLBACK_URLS && RESUME_FALLBACK_URLS.length ? RESUME_FALLBACK_URLS[0] : '../index.html');
      setHistory(prev => [...prev, { id: `open-${Date.now()}`, type: MessageType.INFO, content: `Redirecting to ${candidate} ...`, timestamp: Date.now() }]);
      window.location.href = candidate;
      return;
    }

    if (lowerCmd.startsWith('set resume-url')) {
      const parts = cmd.split(/\s+/);
      const url = parts.slice(2).join(' ').trim();
      if (!url) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: 'set resume-url: missing URL', timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }
      try {
        localStorage.setItem('resumeUrl', url);
        setHistory(prev => [...prev, { id: `set-${Date.now()}`, type: MessageType.SUCCESS, content: `resume URL saved: ${url}`, timestamp: Date.now() }]);
      } catch (e) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `set resume-url: failed to save`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'about') {
      const aboutSection = RESUME_DATA.split('PROJECTS:')[0].trim();
      setHistory(prev => [...prev, { id: `about-${Date.now()}`, type: MessageType.SYSTEM, content: aboutSection, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'projects') {
      const projectsPart = RESUME_DATA.split('PROJECTS:')[1] || '';
      const projSection = projectsPart.split('CONTACT:')[0].trim();
      setHistory(prev => [...prev, { id: `proj-${Date.now()}`, type: MessageType.SYSTEM, content: projSection || 'No projects found', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'contact') {
      const html = `
        <div>
          <div>Email: <a href="mailto:alobinvince@gmail.com">alobinvince@gmail.com</a></div>
          <div>GitHub: <a href="https://github.com/Vince0028" target="_blank" rel="noreferrer">github.com/Vince0028</a></div>
          <div>LinkedIn: <a href="https://linkedin.com" target="_blank" rel="noreferrer">linkedin.com</a></div>
          <div>Website: <a href="/index.html?resume=1">Portfolio (open)</a></div>
        </div>
      `;
      setHistory(prev => [...prev, { id: `contact-${Date.now()}`, type: MessageType.SYSTEM, content: html, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd.startsWith('open ')) {
      const target = cmd.slice(5).trim();
      if (!target) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: 'open: missing target', timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }
      if (target === 'resume' || target === 'gui') {
        window.location.href = '../index.html';
        return;
      }

      const node = findNode(target);
      if (!node) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `open: file not found: ${target}`, timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      if (node.restricted) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `ACCESS DENIED: ${target} is restricted`, timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      if (node.type === 'dir') {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `open: ${target} is a directory`, timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      try {
        const fetchPath = node.path || (target === 'index.html' ? '../index.html' : '/' + target);
        const res = await fetch(fetchPath);
        if (!res.ok) {
          throw new Error('File not found');
        }
        const text = await res.text();
        setHistory(prev => [...prev, { id: `file-${Date.now()}`, type: MessageType.CODE, content: text, timestamp: Date.now() }]);
      } catch (e) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `open: failed to read ${target}`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    if (lowerCmd.startsWith('cat ')) {
      const target = cmd.slice(4).trim();
      if (!target) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: 'cat: missing target', timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      const node = findNode(target);
      if (!node) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `cat: file not found: ${target}`, timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      if (node.restricted) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `ACCESS DENIED: ${target} is restricted`, timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      if (node.type === 'dir') {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `cat: ${target} is a directory`, timestamp: Date.now() }]);
        setIsProcessing(false);
        return;
      }

      try {
        const fetchPath = node.path || (target === 'index.html' ? '../index.html' : '/' + target);
        const res = await fetch(fetchPath);
        if (!res.ok) throw new Error('File not found');
        const text = await res.text();
        setHistory(prev => [...prev, { id: `file-${Date.now()}`, type: MessageType.CODE, content: text, timestamp: Date.now() }]);
      } catch (e) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `cat: failed to read ${target}`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    try {
      const response = await sendMessageToGemini(cmd);
      setHistory(prev => [...prev, { id: `ai-${Date.now()}`, type: MessageType.SYSTEM, content: response, timestamp: Date.now() }]);
    } catch (error) {
      setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: 'Error connecting to AI core.', timestamp: Date.now() }]);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    const handler = async (e: any) => {
      const filename = e?.detail?.filename;
      if (!filename) return;

      const ALLOWED_FILES = [
        'privacy_policy.txt',
        'README.md',
        'LICENSE',
        'index.html',
        'script.js',
        'styles.css',
        'lanyard-3d.js',
        'skillset-order.js',
        'github-contributions.js'
      ];
      if (!ALLOWED_FILES.includes(filename)) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `open: access denied to ${filename}`, timestamp: Date.now() }]);
        return;
      }
      try {
        // Most files are in the parent directory
        const fetchPath = filename === 'privacy_policy.txt' || filename === 'README.md' || filename === 'LICENSE'
          ? '/' + filename
          : '../' + filename;
        const res = await fetch(fetchPath);
        if (!res.ok) { setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `open: cannot open ${filename} (${res.status})`, timestamp: Date.now() }]); return; }
        const text = await res.text();
        setHistory(prev => [...prev, { id: `file-${Date.now()}`, type: MessageType.CODE, content: `----- ${filename} -----\n${text || '[EMPTY FILE]'}\n----- end -----`, timestamp: Date.now() }]);
      } catch (err) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `open: error reading ${filename}`, timestamp: Date.now() }]);
      }
    };
    window.addEventListener('terminal-open-file', handler as EventListener);
    return () => window.removeEventListener('terminal-open-file', handler as EventListener);
  }, []);

  const renderLineContent = (line: TerminalLine) => {
    const content = line.content || '';
    const unescapeHtml = (str: string) => {
      return str.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    const looksLikeHtml = /<a\s|<div|<span|<br|<strong|<em|&lt;\/?div|&lt;a\s/.test(content);
    if (looksLikeHtml && line.type !== MessageType.CODE) {
      const html = looksLikeHtml && content.indexOf('&lt;') !== -1 ? unescapeHtml(content) : content;
      return <div className={THEME_COLOR} dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (line.type === MessageType.CODE) {
      return <pre className={`${THEME_COLOR} whitespace-pre-wrap font-mono text-xs md:text-sm`}>{content || ' '}</pre>;
    }

    return <div className={THEME_COLOR}>{content}</div>;
  };

  return (
    <div className="w-screen h-screen p-2 md:p-6 flex items-center justify-center bg-black overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `radial-gradient(${THEME_COLOR.replace('text-', '')} 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>

      {!privacyOpen && (
        <div className={`relative z-10 w-full max-w-[1600px] h-full md:h-[90vh] flex flex-col md:grid md:grid-cols-12 md:grid-rows-12 gap-4 ${THEME_COLOR}`}>

          <div className={`col-span-12 md:col-span-6 row-span-2 border ${THEME_BORDER} ${THEME_BG} ${THEME_GLOW} relative p-4 flex items-center`}>
            <div className="absolute top-0 left-0 bg-indigo-500 text-black text-xs px-2 font-bold">SYSTEM</div>
            <div className="absolute top-0 right-0 px-2 flex space-x-2 text-xs border-l border-b border-indigo-500/30 items-center">
              <span>NET: ONLINE</span>
              <span>SEC: HIGH</span>
            </div>
            <ClockPanel />
          </div>

          <div className={`col-span-12 md:col-span-6 row-span-2 border ${THEME_BORDER} ${THEME_BG} ${THEME_GLOW} relative overflow-hidden flex items-center justify-center`}>
            <div className="absolute top-0 right-0 bg-indigo-500 text-black text-xs px-2 font-bold">DATA STREAM</div>
            <MatrixRain />
          </div>

          <div className={`hidden md:flex col-span-3 row-span-7 flex-col gap-4 overflow-hidden`}>
            <div className={`flex-1 min-h-0 border ${THEME_BORDER} ${THEME_BG} p-4 relative flex flex-col`}>
              <div className="absolute top-0 left-0 text-[10px] bg-indigo-900/40 px-1 text-indigo-300 font-bold">HARDWARE MONITOR</div>
              <SystemMonitor />
            </div>
            <div className={`shrink-0 border ${THEME_BORDER} ${THEME_BG} p-3 flex flex-col justify-center h-24`}>
              <MemoryBlock />
            </div>
          </div>

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
                  {(line.type === MessageType.SYSTEM || line.type === MessageType.INFO || line.type === MessageType.CODE) && (
                    renderLineContent(line)
                  )}
                </div>
              ))}
              {isProcessing && <div className="animate-pulse">_ PROCESSING...</div>}
              <div ref={terminalEndRef} />
            </div>

            {/* Arch Linux Logo Watermark */}
            <div className="absolute right-[10%] bottom-[20%] pointer-events-none opacity-20 text-indigo-500 font-mono text-[10px] md:text-xs leading-tight whitespace-pre select-none hidden md:block">
              {`                   -\`
                  .o+\`
                 \`ooo/
                \`+oooo:
               \`+oooooo:
               -+oooooo+:
             \`/-:-++oooo+:
            \`/++++/+++++++:
           \`/++++++++++++++:
          \`/+++ooooooooooooo/\`
         ./ooosssso++osssssso+\`
        .oossssso-\`\`\`\`/ossssss+\`
       -osssssso.      :ssssssso.
      :osssssss/        osssso+++.
     /ossssssss/        +ssssooo/-
   \`/ossssso+/:-        -:/+osssso+-
  \`+sso+:-                 \`.-/+oso:
 \`++:.                           \`-/+/
 .\`                                 \`/-`}
            </div>

            {!isBooting && <TerminalInput onSubmit={handleCommand} disabled={isProcessing} />}
          </div>

          <div className={`hidden md:flex col-span-3 row-span-7 border ${THEME_BORDER} ${THEME_BG} p-4 relative flex-col`}>
            <div className="absolute top-0 right-0 text-[10px] bg-indigo-900/40 px-1 text-indigo-300 font-bold">NETWORK STATUS</div>
            <div className="flex-1 flex items-center justify-center opacity-90">
              <OctahedronNetwork networkLevel={networkLevel} />
            </div>
            <div className="h-24 shrink-0 border-t border-indigo-500/30 pt-2">
              <div className="text-[10px] mb-1 text-indigo-300 font-bold">TRAFFIC ANALYSIS</div>
              <TrafficGraph />
            </div>
          </div>

          <div className={`col-span-12 md:col-span-5 row-span-3 border ${THEME_BORDER} ${THEME_BG} p-4`}>
            <FileExplorer />
          </div>

          <div className={`hidden md:flex col-span-7 row-span-3 border ${THEME_BORDER} ${THEME_BG} p-4 items-center justify-center overflow-hidden`}>
            <VirtualKeyboard />
          </div>

        </div>
      )}

      {privacyOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-hidden">
          {/* Background Matrix Rain */}
          <div className="absolute inset-0 z-0 opacity-30">
            <MatrixRain />
          </div>

          {/* ASCII Art Background */}
          <div className="absolute inset-0 z-0 pointer-events-none flex justify-between items-center px-8 md:px-32 opacity-40 text-indigo-500 font-mono text-xs md:text-sm leading-none whitespace-pre select-none origin-center">
            <div className="hidden md:block">
              {`__      __  ___   _   _    ___   _____ 
\\ \\    / / |_ _| | \\ | |  / __| | ____|
 \\ \\  / /   | |  |  \\| | | |    |  _|  
  \\ \\/ /    | |  | |\\  | | |___ | |___ 
   \\__/    |___| |_| \\_|  \\___| |_____|`}
            </div>
            <div className="hidden md:block text-right scale-110 origin-right">
              {`   _      _       ___    ___   ___   _   _ 
  /_\\    | |     / _ \\  | _ ) |_ _| | \\ | |
 / _ \\   | |__  | (_) | | _ \\  | |  |  \\| |
/_/ \\_\\  |____|  \\___/  |___/ |___| |_| \\_|`}
            </div>
          </div>

          <div className={`w-full max-w-lg border-2 ${THEME_BORDER} bg-black/80 p-8 relative ${THEME_GLOW} z-10 backdrop-blur-md`}>
            <h2 className="text-2xl font-bold mb-4 text-center">WELCOME TO VINCES RESUME</h2>
            <div className="border-t border-b border-indigo-500/30 py-4 mb-4">
              <h3 className="text-lg font-bold mb-2">PRIVACY_POLICY.TXT</h3>
              <p className="text-sm leading-relaxed opacity-80">
                This terminal does not collect personal data. All commands entered are processed locally or sent anonymously to the AI core for response generation.
                <br /><br />
                Cookies are only used for session persistence. No tracking pixels detected.
                <br /><br />
                System Integrity: SECURE.
              </p>
            </div>

            <div className="mb-6 flex flex-col items-center justify-center space-y-8">
              <div className="flex flex-col items-center relative">
                <div className="text-xs mb-2 opacity-70 uppercase tracking-widest">Biometric Scan</div>
                <FingerprintScanner onScanComplete={handleScanComplete} isComplete={isFingerprintVerified} />
              </div>

              <div className="w-full flex items-center justify-center space-x-4 opacity-50">
                <div className="h-px bg-indigo-500 w-1/3"></div>
                <span className="text-xs font-bold text-indigo-400">AND</span>
                <div className="h-px bg-indigo-500 w-1/3"></div>
              </div>

              <div className="w-full">
                <div className="text-xs mb-2 opacity-70 uppercase tracking-widest text-center">Manual Signature</div>
                <div className={`border ${THEME_BORDER} bg-black/50 relative h-24 w-full cursor-crosshair`}>
                  <canvas
                    ref={signatureRef}
                    width={450}
                    height={96}
                    className="w-full h-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <button
                    onClick={clearSignature}
                    className="absolute top-2 right-2 text-[10px] border border-red-500/50 text-red-400 px-2 py-1 hover:bg-red-900/30 transition-colors"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleAcknowledge}
              disabled={!isFingerprintVerified || !isSignatureVerified}
              className={`w-full border ${THEME_BORDER} ${isFingerprintVerified && isSignatureVerified ? 'bg-indigo-500/20 hover:bg-indigo-500 hover:text-black cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'opacity-50 cursor-not-allowed'} px-6 py-3 transition-all uppercase font-bold tracking-wider`}
            >
              {isFingerprintVerified && isSignatureVerified ? 'ACKNOWLEDGE & ENTER SYSTEM' : 'VERIFICATION REQUIRED'}
            </button>
          </div>
        </div>
      )}
    </div >
  );
};

export default App;
