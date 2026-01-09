import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalLine, MessageType } from './types';
import { INITIAL_BOOT_SEQUENCE, THEME_BORDER, THEME_COLOR, THEME_GLOW, THEME_BG, RESUME_DATA, RESUME_FALLBACK_URLS, FILE_SYSTEM, FileSystemNode } from './constants';
import { playDaisyBell, pauseDaisyBell, getDaisyBellAudio, playIAm, pauseIAm, getIAmAudio, I_AM_SUBTITLE } from './easter_eggs';
import TerminalInput from './components/TerminalInput';
import SystemMonitor from './components/SystemMonitor';
import FileExplorer from './components/FileExplorer';
import ClockPanel from './components/ClockPanel';
import VirtualKeyboard from './components/VirtualKeyboard';
import BinaryGlobeNetwork from './components/BinaryGlobeNetwork';
import FingerprintScanner from './components/FingerprintScanner';
import MatrixRain from './components/MatrixRain';
import MemoryBlock from './components/MemoryBlock';
import TetrisGame from './components/TetrisGame';
import PongGame from './components/PongGame';
import SnakeGame from './components/SnakeGame';
import PacmanGame from './components/PacmanGame';
import LiveChat from './components/LiveChat';
import Flicker from './components/Flicker';
import BrightnessCheck from './components/BrightnessCheck';
import RadarMain from './components/Radar/RadarMain';

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

const TrafficGraph: React.FC<{ isSpookyActive?: boolean }> = ({ isSpookyActive = false }) => {
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
          className={`flex-1 transition-all duration-300 ease-in-out ${isSpookyActive
            ? 'bg-red-500/30 border-t border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            : 'bg-indigo-500/30 border-t border-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.3)]'
            }`}
        />
      ))}
    </div>
  );
};

type TimedSubtitle = { time: number; text: string };

const SUBTITLE_LEAD_SECONDS = 0.25;

const toSeconds = (stamp: string): number | null => {
  const parts = stamp.split(':').map((part) => Number(part));
  if (parts.some((n) => Number.isNaN(n))) return null;

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
};

const parseTimedSubtitles = (raw: string): TimedSubtitle[] => {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/\((\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\)/);
      if (!match) return null;
      const seconds = toSeconds(match[1]);
      if (seconds === null) return null;
      const text = line.replace(match[0], '').trim();
      if (!text) return null;
      return { time: seconds, text };
    })
    .filter((entry): entry is TimedSubtitle => Boolean(entry))
    .sort((a, b) => a.time - b.time);
};

const App: React.FC = () => {
  const [showBrightnessCheck, setShowBrightnessCheck] = useState(true);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [privacyOpen, setPrivacyOpen] = useState(true);
  const [networkLevel, setNetworkLevel] = useState(60);
  const [gameMode, setGameMode] = useState<'none' | 'tetris' | 'pong' | 'snake' | 'pacman' | 'chat'>('none');
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [isDaisyBellPlaying, setIsDaisyBellPlaying] = useState(false);
  const [isIAmPlaying, setIsIAmPlaying] = useState(false);
  const [timedSubtitles, setTimedSubtitles] = useState<TimedSubtitle[]>([]);
  const [currentIAmSubtitle, setCurrentIAmSubtitle] = useState('');
  const [isSpookyActive, setIsSpookyActive] = useState(false);
  const [horrorStyle, setHorrorStyle] = useState<React.CSSProperties>({
    transform: 'translate3d(0, 0, 0)',
    filter: 'none',
    opacity: 1
  });
  const flickerWrap = (node: React.ReactNode) => {
    if (!isSpookyActive) return node;
    if (React.isValidElement(node)) {
      const { className = '', ...rest } = node.props as { className?: string };
      return (
        <div className={className}>
          <Flicker className="block w-full h-full" errorChance={0.12}>
            {React.cloneElement(node, { ...rest, className: `${className} w-full h-full` })}
          </Flicker>
        </div>
      );
    }
    return (
      <div>
        <Flicker className="block w-full h-full" errorChance={0.12}>
          {node}
        </Flicker>
      </div>
    );
  };

  const [isFingerprintVerified, setIsFingerprintVerified] = useState(false);

  const handleScanComplete = () => {
    setIsFingerprintVerified(true);
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
    setTimedSubtitles(parseTimedSubtitles(I_AM_SUBTITLE));
  }, []);

  useEffect(() => {
    const audio = getIAmAudio();

    const syncSubtitle = () => {
      if (!timedSubtitles.length) {
        setCurrentIAmSubtitle('');
      } else {
        const now = audio.currentTime;
        let latest = '';
        for (const entry of timedSubtitles) {
          if (now + SUBTITLE_LEAD_SECONDS >= entry.time) {
            latest = entry.text;
          } else {
            break;
          }
        }
        setCurrentIAmSubtitle(latest);
      }

      const isPlaying = !audio.paused && !audio.ended && audio.currentTime > 0;
      setIsIAmPlaying((prev) => (prev === isPlaying ? prev : isPlaying));
    };

    const handleEnded = () => {
      setIsIAmPlaying(false);
      setCurrentIAmSubtitle('');
    };

    audio.addEventListener('timeupdate', syncSubtitle);
    audio.addEventListener('seeking', syncSubtitle);
    audio.addEventListener('seeked', syncSubtitle);
    audio.addEventListener('pause', syncSubtitle);
    audio.addEventListener('ended', handleEnded);
    syncSubtitle();

    return () => {
      audio.removeEventListener('timeupdate', syncSubtitle);
      audio.removeEventListener('seeking', syncSubtitle);
      audio.removeEventListener('seeked', syncSubtitle);
      audio.removeEventListener('pause', syncSubtitle);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [timedSubtitles]);

  useEffect(() => {
    if (!isSpookyActive) {
      setHorrorStyle({ transform: 'translate3d(0, 0, 0)', filter: 'none', opacity: 1 });
      return;
    }

    const jitter = () => {
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = (Math.random() - 0.5) * 6;
      const rotate = (Math.random() - 0.5) * 1.4;
      const scale = 1 + (Math.random() - 0.5) * 0.01;
      const opacity = 0.82 + Math.random() * 0.16;
      const blur = Math.random() < 0.35 ? `blur(${(Math.random() * 1.4).toFixed(2)}px)` : 'none';
      const contrast = (1.1 + Math.random() * 0.6).toFixed(2);
      const saturate = (0.9 + Math.random() * 0.5).toFixed(2);

      setHorrorStyle({
        transform: `translate(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
        filter: `contrast(${contrast}) saturate(${saturate}) ${blur}`,
        opacity
      });
    };

    const interval = setInterval(jitter, 90);
    jitter();

    return () => {
      clearInterval(interval);
      setHorrorStyle({ transform: 'translate3d(0, 0, 0)', filter: 'none', opacity: 1 });
    };
  }, [isSpookyActive]);

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

  const handleGameExit = useCallback(() => {
    let exitMsg = '';
    switch (gameMode) {
      case 'tetris':
        exitMsg = 'Exited Tetris. Welcome back to bash.';
        break;
      case 'pong':
        exitMsg = 'Exited Pong. Welcome back to bash.';
        break;
      case 'snake':
        exitMsg = 'Exited Snake. Welcome back to bash.';
        break;
      case 'pacman':
        exitMsg = 'Exited Pac-Man. Welcome back to bash.';
        break;
      case 'chat':
        exitMsg = 'Exited Live Chat. Welcome back to bash.';
        break;
      default:
        exitMsg = 'Exited game mode.';
    }
    setGameMode('none');
    setHistory(prev => [...prev, { id: `exit-${Date.now()}`, type: MessageType.INFO, content: exitMsg, timestamp: Date.now() }]);
  }, [gameMode]);

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
      const helpText = `\nAVAILABLE COMMANDS:\n-------------------\nHELP               - Show this message\nCLEAR              - Clear terminal buffer\nABOUT              - Display user summary\nPROJECTS           - List portfolio projects\nCONTACT            - Show contact channels\nPRIVACY            - View Privacy Policy\nOPEN <file>        - Open or display file\nTREE               - Show file system structure\nSHOW ME GAMES      - List available terminal games\nLIVE CHAT          - Join live chat room\nOPEN GUI           - Open graphical resume (same tab)\nSUDO SIMPLE RESUME - Open simple portfolio page\n\nTIP: Try asking the system random questions... there might be easter eggs hidden!\nCan't find any? Just say 'please master' and I'll show you.\n`;
      setHistory(prev => [...prev, { id: `sys-${Date.now()}`, type: MessageType.SYSTEM, content: helpText, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'show me games' || lowerCmd === 'games' || lowerCmd === 'list games') {
      const gamesText = `\nAVAILABLE GAMES:\n----------------\nTETRIS  - Code: PLAY TETRIS\nPONG    - Code: PLAY PONG\nSNAKE   - Code: PLAY SNAKE\nPACMAN  - Code: PLAY PACMAN\n`;
      setHistory(prev => [...prev, { id: `games-${Date.now()}`, type: MessageType.SYSTEM, content: gamesText, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'play tetris') {
      setGameMode('tetris');
      setHistory(prev => [...prev, { id: `game-${Date.now()}`, type: MessageType.INFO, content: 'Starting Tetris...', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'play pong' || lowerCmd === 'pong' || lowerCmd.replace(/\s+/g, ' ') === 'play pong') {
      setGameMode('pong');
      setHistory(prev => [...prev, { id: `game-${Date.now()}`, type: MessageType.INFO, content: 'Starting Pong...', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'play snake' || lowerCmd === 'snake' || lowerCmd.replace(/\s+/g, ' ') === 'play snake') {
      setGameMode('snake');
      setHistory(prev => [...prev, { id: `game-${Date.now()}`, type: MessageType.INFO, content: 'Starting Snake...', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'play pacman' || lowerCmd === 'pacman' || lowerCmd.replace(/\s+/g, ' ') === 'play pacman') {
      setGameMode('pacman');
      setHistory(prev => [...prev, { id: `game-${Date.now()}`, type: MessageType.INFO, content: 'Starting Pac-Man...', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'live chat' || lowerCmd === 'chat' || lowerCmd === 'bash live chat') {
      setGameMode('chat');
      setHistory(prev => [...prev, { id: `chat-${Date.now()}`, type: MessageType.INFO, content: 'Initializing Live Chat...', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'play daisy bell') {
      try {
        pauseIAm();
        setIsIAmPlaying(false);

        await playDaisyBell();
        setIsDaisyBellPlaying(true);


        const audio = getDaisyBellAudio();
        audio.onended = () => setIsDaisyBellPlaying(false);
        audio.onpause = () => setIsDaisyBellPlaying(false);

        setHistory(prev => [...prev, { id: `daisy-${Date.now()}`, type: MessageType.SUCCESS, content: '♪ ♪ ♪ Daisy Bell (1961 - First Song Sung by a Computer) ♪ ♪ ♪\n\nDaisy, Daisy, give me your answer do.\nI\'m half crazy all for the love of you!\nIt won\'t be a stylish marriage,\nI can\'t afford a carriage,\nBut you\'ll look sweet upon the seat\nOf a bicycle built for two! ♪ ♪\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎵 NOW PLAYING 🎵\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCONTROLS:\n  • Type \'pause daisy bell\' to PAUSE ⏸\n  • Type \'stop daisy bell\' to STOP ⏹\n  • Type \'play daisy bell\' to RESUME ▶', timestamp: Date.now() }]);
      } catch (e) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `Error: ${e instanceof Error ? e.message : 'Could not load audio file'}`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'play i am' || lowerCmd === 'play i_am' || lowerCmd === 'i am' || lowerCmd === 'i_am') {
      try {
        pauseDaisyBell();
        setIsDaisyBellPlaying(false);

        if (isIAmPlaying) {
          const current = getIAmAudio();
          current.currentTime = 0;
        }

        await playIAm();

        const audio = getIAmAudio();

        audio.onended = null;
        audio.onpause = null;
        audio.onplay = null;

        audio.onended = () => {
          setIsIAmPlaying(false);
          setIsSpookyActive(false);
        };
        audio.onpause = () => {
          setIsIAmPlaying(false);
          setIsSpookyActive(false);
        };
        audio.onplay = () => {
          setIsIAmPlaying(true);
          setIsSpookyActive(true);
        };

        setIsIAmPlaying(true);
        setIsSpookyActive(true);

        setCurrentIAmSubtitle('');

        const first = timedSubtitles[0];
        if (first && first.time <= SUBTITLE_LEAD_SECONDS + 0.05) {
          setCurrentIAmSubtitle(first.text);
        }

        const subtitle = I_AM_SUBTITLE && I_AM_SUBTITLE.trim().length > 0 ? I_AM_SUBTITLE.trim() : 'Subtitle not set. Add lyrics in easter_eggs.ts (I_AM_SUBTITLE).';

        setHistory(prev => [...prev, { id: `iam-${Date.now()}`, type: MessageType.SUCCESS, content: `♪ ♪ ♪ I AM — a nod to the book that inspired this track ♪ ♪ ♪\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎵 NOW PLAYING 🎵\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSUBTITLE:\n${subtitle}\n\nCONTROLS:\n  • Type 'pause i am' to PAUSE ⏸\n  • Type 'stop i am' to STOP ⏹\n  • Type 'play i am' to RESTART ▶`, timestamp: Date.now() }]);
      } catch (e) {
        setHistory(prev => [...prev, { id: `err-${Date.now()}`, type: MessageType.ERROR, content: `Error: ${e instanceof Error ? e.message : 'Could not load audio file'}`, timestamp: Date.now() }]);
      }
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'pause i am' || lowerCmd === 'pause i_am') {
      pauseIAm();
      setIsIAmPlaying(false);
      setIsSpookyActive(false);
      setHistory(prev => [...prev, { id: `pause-iam-${Date.now()}`, type: MessageType.INFO, content: '⏸ I AM paused. Type \'play i am\' to resume.', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'stop i am' || lowerCmd === 'stop i_am') {
      pauseIAm();
      const audio = getIAmAudio();
      audio.currentTime = 0;
      setIsIAmPlaying(false);
      setIsSpookyActive(false);
      setCurrentIAmSubtitle('');
      setHistory(prev => [...prev, { id: `stop-iam-${Date.now()}`, type: MessageType.INFO, content: '⏹ I AM stopped.', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'pause daisy bell') {
      pauseDaisyBell();
      setIsDaisyBellPlaying(false);
      setHistory(prev => [...prev, { id: `pause-${Date.now()}`, type: MessageType.INFO, content: '⏸ Daisy Bell paused. Type \'play daisy bell\' to resume.', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'stop daisy bell' || lowerCmd === 'resume daisy bell') {
      pauseDaisyBell();
      const audio = getDaisyBellAudio();
      audio.currentTime = 0;
      setIsDaisyBellPlaying(false);
      setHistory(prev => [...prev, { id: `stop-${Date.now()}`, type: MessageType.INFO, content: '⏹ Daisy Bell stopped.', timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'please master') {
      const easterEggList = `\nEASTER EGGS REVEALED:\n=====================\n\nVINCE-RELATED:\n- is vince gay?\n- is vince handsome?\n- is vince ugly?\n- who is vince?\n\nGREETINGS:\n- hello / hi / hey\n- hello vince / hi vince / hey vince\n- good morning / good afternoon / good evening\n- thank you / thanks\n- bye / goodbye / exit / quit\n\nGENERAL KNOWLEDGE:\n- what is the meaning of life?\n- who created you?\n- what is your name?\n- how are you?\n- what can you do?\n- are you real?\n\nFUN STUFF:\n- tell me a joke / joke (35 random jokes!)\n- tell me a fun fact / fun fact\n- i love you\n\nPOP CULTURE:\n- sudo make me a sandwich\n- make me a sandwich\n- hello there\n- the cake is a lie\n- do a barrel roll\n\nCOMPUTER HISTORY:\n- play daisy bell (🎵 First song ever sung by a computer in 1961!)\n- pause daisy bell (⏸ Pause the song)\n- stop daisy bell (⏹ Stop and reset the song)\n\nBOOK REFERENCE:\n- play i am (🎵 I Have No Mouth, and I Must Scream - reference)\n- pause i am (⏸ Pause the track)\n- stop i am (⏹ Stop and reset the track)\n\nEASTER EGG WINNERS:\n- type: easter egg winner\n\nTry them all!, Just type it in the bash\n`;
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: easterEggList, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'easter egg winner' || lowerCmd === 'easter egg winners') {
      const winnerBoard = `\nEASTER EGG WINNERS (5 PESOS):\n-----------------------------\n1) TBD\n2) TBD\n3) TBD\n4) TBD\n5) TBD\n`;
      setHistory(prev => [...prev, { id: `winner-${Date.now()}`, type: MessageType.SYSTEM, content: winnerBoard, timestamp: Date.now() }]);
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

    if (lowerCmd === 'sudo simple resume' || lowerCmd === 'simple resume' || lowerCmd === 'simple portfolio' || lowerCmd === 'go back to simple resume') {
      const target = '../html/simple_portfolio.html';
      setHistory(prev => [...prev, { id: `simple-${Date.now()}`, type: MessageType.INFO, content: `Opening ${target} ...`, timestamp: Date.now() }]);
      window.location.href = target;
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


    if (lowerCmd === 'is vince gay' || lowerCmd === 'is vince gay?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "No, Vince isn't... but Rick is", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'is vince handsome' || lowerCmd === 'is vince handsome?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Most definitely", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'is vince ugly' || lowerCmd === 'is vince ugly?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Definitely not", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'is vince smart' || lowerCmd === 'is vince smart?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Smart enough to build this terminal. You decide.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince cool' || lowerCmd === 'is vince cool?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Cooler than a server room at 18°C", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince single' || lowerCmd === 'is vince single?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "That's classified information. Ask him yourself!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'does vince have a girlfriend' || lowerCmd === 'does vince have a girlfriend?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "His main relationship is with his code editor.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince rich' || lowerCmd === 'is vince rich?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Rich in skills, knowledge, and GitHub commits.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince tall' || lowerCmd === 'is vince tall?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Tall enough to reach the cloud... computing.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince funny' || lowerCmd === 'is vince funny?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "You're talking to his terminal. What do you think?", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'does vince sleep' || lowerCmd === 'does vince sleep?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Sleep is for those who don't have merge conflicts.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what does vince eat' || lowerCmd === 'what does vince eat?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Mostly coffee, pizza, and stack overflow answers.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'can vince code' || lowerCmd === 'can vince code?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "You're literally using his code right now.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince a hacker' || lowerCmd === 'is vince a hacker?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "He prefers 'security enthusiast' or 'ethical developer'.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince a gamer' || lowerCmd === 'is vince a gamer?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Only when debugging counts as a game.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'does vince like anime' || lowerCmd === 'does vince like anime?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "His favorite anime is 'Code Geass' - fitting, right?", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what is vince afraid of' || lowerCmd === 'what is vince afraid of?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Production bugs and missing semicolons.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'is vince perfect' || lowerCmd === 'is vince perfect?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Nobody's perfect, but his code is pretty close.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'does vince exercise' || lowerCmd === 'does vince exercise?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Does typing 100 WPM count as cardio?", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what is vince doing right now' || lowerCmd === 'what is vince doing right now?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Probably coding, debugging, or adding more easter eggs.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'hire vince' || lowerCmd === 'hire vince!') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Great choice! Check the 'contact' section to reach out.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'vince is the best' || lowerCmd === 'vince is the best!') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "I couldn't agree more! You have excellent taste.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'i love vince' || lowerCmd === 'i love vince!') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Vince appreciates the love! Feel free to connect via the contact section.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'hello' || lowerCmd === 'hi' || lowerCmd === 'hey') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Hello! Welcome to BENBEN OS. Type 'help' to see available commands.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'hello vince' || lowerCmd === 'hi vince' || lowerCmd === 'hey vince') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Hey there! Thanks for visiting my portfolio!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'good morning' || lowerCmd === 'good afternoon' || lowerCmd === 'good evening') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Good day to you too! Hope you're having a great time.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'what is the meaning of life' || lowerCmd === 'what is the meaning of life?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "42. Obviously.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'who created you' || lowerCmd === 'who created you?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Vince did! He's pretty cool, right?", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what is your name' || lowerCmd === 'what is your name?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "I'm BENBEN OS v9.0, your friendly neighborhood terminal.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'how are you' || lowerCmd === 'how are you?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Running at optimal performance! Thanks for asking.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'tell me a joke' || lowerCmd === 'joke') {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
        "Why did the programmer quit his job? He didn't get arrays.",
        "What's a programmer's favorite hangout? The Foo Bar.",
        "Why do Java developers wear glasses? Because they can't C#.",
        "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?",
        "Why did the developer go broke? Because he used up all his cache.",
        "What do you call a programmer from Finland? Nerdic.",
        "How do you comfort a JavaScript bug? You console it.",
        "Why did the programmer get stuck in the shower? The shampoo bottle said: Lather, Rinse, Repeat.",
        "What's the object-oriented way to become wealthy? Inheritance.",
        "Why do programmers always mix up Halloween and Christmas? Because Oct 31 equals Dec 25.",
        "A programmer's wife tells him: Go to the store and pick up a loaf of bread. If they have eggs, get a dozen. He returns with 12 loaves of bread.",
        "Why don't programmers like nature? It has too many bugs.",
        "What did the router say to the doctor? It hurts when IP.",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
        "What's a programmer's favorite place to hang out? The Git Hub.",
        "Why did the functions stop calling each other? Because they had constant arguments.",
        "What do you call 8 hobbits? A hobbyte.",
        "Why do programmers hate the outdoors? The sunlight causes too many reflections.",
        "How does a programmer fix a broken pizza? With a pizza debugger.",
        "Why did the developer stay calm during the crisis? He had exception handling.",
        "What's the best thing about a Boolean? Even if you're wrong, you're only off by a bit.",
        "Why did the programmer use the entire bottle of shampoo? Because the instructions said: Apply shampoo, rinse, repeat.",
        "What do you call a programmer who doesn't comment their code? A monster.",
        "Why did the programmer always carry a ladder? To reach the cloud.",
        "How do you tell HTML from HTML5? Try it out in Internet Explorer. Did it work? No? It's HTML5.",
        "Why did the database administrator leave his wife? She had one-to-many relationships.",
        "What's the difference between a programmer and a user? A programmer thinks a kilobyte is 1024 bytes, a user thinks it's 1000.",
        "Why do Python programmers prefer snakes? Because they're not into Java.",
        "What did the computer do at lunchtime? Had a byte.",
        "Why was the computer cold? It left its Windows open.",
        "What do you call a computer that sings? A Dell.",
        "Why did the PowerPoint presentation cross the road? To get to the other slide.",
        "What's a computer's favorite snack? Microchips."
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: joke, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'tell me a fun fact' || lowerCmd === 'fun fact') {
      const facts = [
        "The first computer bug was an actual bug - a moth found in a computer in 1947.",
        "The first 1GB hard drive weighed over 500 pounds and cost $40,000.",
        "The average person blinks 15-20 times per minute, but only 7 times while using a computer.",
        "The first computer mouse was made of wood.",
        "Email existed before the World Wide Web."
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: fact, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'sudo make me a sandwich') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Okay. *makes you a sandwich*", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'make me a sandwich') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.ERROR, content: "Permission denied. Try 'sudo make me a sandwich'.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'hello there') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "General Kenobi! You are a bold one.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'the cake is a lie') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "This was a triumph. I'm making a note here: huge success.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'do a barrel roll') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "*spins terminal 360 degrees* Done!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'thank you' || lowerCmd === 'thanks') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "You're welcome! Happy to help.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'bye' || lowerCmd === 'goodbye' || lowerCmd === 'exit' || lowerCmd === 'quit') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Goodbye! Thanks for visiting. Come back soon!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'who is vince' || lowerCmd === 'who is vince?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Vince is an IT student at Asia Pacific College, passionate about web development and creative coding. Type 'about' to learn more!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what can you do' || lowerCmd === 'what can you do?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "I can show you Vince's portfolio, tell jokes, share fun facts, and more! Type 'help' to see all commands.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'are you real' || lowerCmd === 'are you real?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "As real as any code can be. I exist in the digital realm!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'does vince exercise' || lowerCmd === 'does vince exercise?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Does typing 100 WPM count as cardio?", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what is vince doing right now' || lowerCmd === 'what is vince doing right now?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Probably coding, debugging, or adding more easter eggs.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'hire vince' || lowerCmd === 'hire vince!') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Great choice! Check the 'contact' section to reach out.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'vince is the best' || lowerCmd === 'vince is the best!') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "I couldn't agree more! You have excellent taste.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'i love vince' || lowerCmd === 'i love vince!') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Vince appreciates the love! Feel free to connect via the contact section.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'hello' || lowerCmd === 'hi' || lowerCmd === 'hey') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Hello! Welcome to BENBEN OS. Type 'help' to see available commands.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'hello vince' || lowerCmd === 'hi vince' || lowerCmd === 'hey vince') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Hey there! Thanks for visiting my portfolio!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'good morning' || lowerCmd === 'good afternoon' || lowerCmd === 'good evening') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Good day to you too! Hope you're having a great time.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'what is the meaning of life' || lowerCmd === 'what is the meaning of life?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "42. Obviously.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'who created you' || lowerCmd === 'who created you?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Vince did! He's pretty cool, right?", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what is your name' || lowerCmd === 'what is your name?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "I'm BENBEN OS v9.0, your friendly neighborhood terminal.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'how are you' || lowerCmd === 'how are you?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Running at optimal performance! Thanks for asking.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'tell me a joke' || lowerCmd === 'joke') {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
        "Why did the programmer quit his job? He didn't get arrays.",
        "What's a programmer's favorite hangout? The Foo Bar.",
        "Why do Java developers wear glasses? Because they can't C#.",
        "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?",
        "Why did the developer go broke? Because he used up all his cache.",
        "What do you call a programmer from Finland? Nerdic.",
        "How do you comfort a JavaScript bug? You console it.",
        "Why did the programmer get stuck in the shower? The shampoo bottle said: Lather, Rinse, Repeat.",
        "What's the object-oriented way to become wealthy? Inheritance.",
        "Why do programmers always mix up Halloween and Christmas? Because Oct 31 equals Dec 25.",
        "A programmer's wife tells him: Go to the store and pick up a loaf of bread. If they have eggs, get a dozen. He returns with 12 loaves of bread.",
        "Why don't programmers like nature? It has too many bugs.",
        "What did the router say to the doctor? It hurts when IP.",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
        "What's a programmer's favorite place to hang out? The Git Hub.",
        "Why did the functions stop calling each other? Because they had constant arguments.",
        "What do you call 8 hobbits? A hobbyte.",
        "Why do programmers hate the outdoors? The sunlight causes too many reflections.",
        "How does a programmer fix a broken pizza? With a pizza debugger.",
        "Why did the developer stay calm during the crisis? He had exception handling.",
        "What's the best thing about a Boolean? Even if you're wrong, you're only off by a bit.",
        "Why did the programmer use the entire bottle of shampoo? Because the instructions said: Apply shampoo, rinse, repeat.",
        "What do you call a programmer who doesn't comment their code? A monster.",
        "Why did the programmer always carry a ladder? To reach the cloud.",
        "How do you tell HTML from HTML5? Try it out in Internet Explorer. Did it work? No? It's HTML5.",
        "Why did the database administrator leave his wife? She had one-to-many relationships.",
        "What's the difference between a programmer and a user? A programmer thinks a kilobyte is 1024 bytes, a user thinks it's 1000.",
        "Why do Python programmers prefer snakes? Because they're not into Java.",
        "What did the computer do at lunchtime? Had a byte.",
        "Why was the computer cold? It left its Windows open.",
        "What do you call a computer that sings? A Dell.",
        "Why did the PowerPoint presentation cross the road? To get to the other slide.",
        "What's a computer's favorite snack? Microchips."
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: joke, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'tell me a fun fact' || lowerCmd === 'fun fact') {
      const facts = [
        "The first computer bug was an actual bug - a moth found in a computer in 1947.",
        "The first 1GB hard drive weighed over 500 pounds and cost $40,000.",
        "The average person blinks 15-20 times per minute, but only 7 times while using a computer.",
        "The first computer mouse was made of wood.",
        "Email existed before the World Wide Web."
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: fact, timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'sudo make me a sandwich') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Okay. *makes you a sandwich*", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'make me a sandwich') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.ERROR, content: "Permission denied. Try 'sudo make me a sandwich'.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'hello there') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "General Kenobi! You are a bold one.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'the cake is a lie') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "This was a triumph. I'm making a note here: huge success.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'do a barrel roll') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "*spins terminal 360 degrees* Done!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }


    if (lowerCmd === 'thank you' || lowerCmd === 'thanks') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "You're welcome! Happy to help.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'bye' || lowerCmd === 'goodbye' || lowerCmd === 'exit' || lowerCmd === 'quit') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Goodbye! Thanks for visiting. Come back soon!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'who is vince' || lowerCmd === 'who is vince?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Vince is an IT student at Asia Pacific College, passionate about web development and creative coding. Type 'about' to learn more!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'what can you do' || lowerCmd === 'what can you do?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "I can show you Vince's portfolio, tell jokes, share fun facts, and more! Type 'help' to see all commands.", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'are you real' || lowerCmd === 'are you real?') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "As real as any code can be. I exist in the digital realm!", timestamp: Date.now() }]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd === 'i love you') {
      setHistory(prev => [...prev, { id: `easter-${Date.now()}`, type: MessageType.SYSTEM, content: "Aww, that's sweet! I'm just a terminal though. Maybe check out Vince's projects instead?", timestamp: Date.now() }]);
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


    const sarcasticResponses = [
      "Type better.",
      "Wrong answer.",
      "Almost!",
      "Almost close??",
      "Nope. Try again.",
      "Command not found. Did you even try?",
      "Error 404: Brain not found.",
      "That's not even close.",
      "Are you just mashing keys?",
      "Invalid. Please use your brain.",
      "System says: No.",
      "Nice try, but no.",
      "Command rejected. Skill issue.",
      "Syntax error: You.",
      "Permission denied: Common sense required.",
      "Fatal error: User incompetence.",
      "Segmentation fault: Your typing.",
      "Access denied: Learn to type first.",
      "Command unclear. Are you okay?",
      "System overload: Too much nonsense.",
      "Error: Command too dumb to process.",
      "Nah.",
      "Absolutely not.",
      "Keep trying, maybe?",
      "So close! (Not really)",
      "You're getting warmer! (You're not)",
      "One more try! (Give up)",
      "Type 'help' if you're lost.",
      "This isn't it, chief.",
      "Bruh.",
      "Really?",
      "Yikes.",
      "Oof.",
      "Big oof.",
      "L command.",
      "Ratio.",
      "Touch grass, then try again.",
      "Command failed successfully.",
      "Task failed: You.",
      "System status: Disappointed.",
      "CPU usage: 100% cringe.",
      "Memory leak detected: Your brain.",
      "Stack overflow: Your mistakes.",
      "Null pointer exception: Your logic.",
      "Undefined behavior: This command.",
      "Compiler error: You need debugging.",
      "Runtime error: Existence.",
      "404: Skill not found.",
      "403: Forbidden. Too silly.",
      "500: Internal server error. It's you.",
      "503: Service unavailable. Try later. Or never."
    ];

    const randomResponse = sarcasticResponses[Math.floor(Math.random() * sarcasticResponses.length)];
    setHistory(prev => [...prev, { id: `sarcasm-${Date.now()}`, type: MessageType.ERROR, content: randomResponse, timestamp: Date.now() }]);
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



    if (content.includes("TYPE 'help' FOR AVAILABLE COMMANDS")) {
      return <div className={`${THEME_COLOR} text-lg md:text-2xl font-bold animate-pulse mt-2 mb-2`}>{content}</div>;
    }

    return <div className={THEME_COLOR}>{content}</div>;
  };

  const isGameActive = gameMode !== 'none';

  if (showBrightnessCheck) {
    return <BrightnessCheck onComplete={() => setShowBrightnessCheck(false)} />;
  }

  return (
    <div className="w-screen min-h-screen md:h-screen p-2 md:p-6 flex justify-center items-start bg-black md:overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `radial-gradient(${THEME_COLOR.replace('text-', '')} 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>

      {!privacyOpen && (
        <>
          <div
            className={`relative z-10 w-full max-w-[1600px] min-h-full md:h-[90vh] flex flex-col md:grid md:grid-cols-12 md:grid-rows-12 gap-4 ${THEME_COLOR}`}
            style={
              isSpookyActive
                ? {
                  ...horrorStyle,
                  transition: 'transform 90ms linear, filter 90ms linear, opacity 90ms linear'
                }
                : undefined
            }
          >

            {flickerWrap(
              <div className={`col-span-12 md:col-span-4 row-span-2 border ${THEME_BORDER} ${THEME_BG} ${THEME_GLOW} relative p-4 flex items-center`}>
                <div className="absolute top-0 left-0 bg-indigo-500 text-black text-xs px-2 font-bold">SYSTEM</div>
                <div className="absolute top-0 right-0 px-2 flex space-x-2 text-xs border-l border-b border-indigo-500/30 items-center">
                  <span>NET: ONLINE</span>
                  <span>SEC: HIGH</span>
                </div>
                <ClockPanel isVoicePlaying={isSpookyActive} />
              </div>
            )}

            {flickerWrap(
              <div className={`col-span-12 md:col-span-2 row-span-2 border ${THEME_BORDER} ${THEME_BG} ${THEME_GLOW} relative overflow-hidden flex items-center justify-center`}>
                <RadarMain />
              </div>
            )}

            {flickerWrap(
              <div className={`col-span-12 md:col-span-6 row-span-2 border ${THEME_BORDER} ${THEME_BG} ${THEME_GLOW} relative overflow-hidden flex items-center justify-center`}>
                {!isEasterEggActive && !isSpookyActive && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-black text-base px-2 py-1 font-bold tracking-wide">DATA STREAM</div>
                )}
                {isSpookyActive && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-base px-2 py-1 font-bold tracking-wide animate-pulse">SYSTEM BREACH</div>
                )}
                <MatrixRain onEasterEggChange={setIsEasterEggActive} isVoicePlaying={isSpookyActive} />
              </div>
            )}

            {flickerWrap(
              <div className={`hidden md:flex col-span-3 row-span-7 flex-col gap-4 overflow-hidden`}>
                <div className={`flex-1 min-h-0 border ${THEME_BORDER} ${THEME_BG} p-4 relative flex flex-col`}>
                  <div className="absolute top-0 left-0 text-[10px] bg-indigo-900/40 px-1 text-indigo-300 font-bold">HARDWARE MONITOR</div>
                  <SystemMonitor isSpookyActive={isSpookyActive} />
                </div>
                <div className={`shrink-0 border ${THEME_BORDER} ${THEME_BG} p-3 flex flex-col justify-center h-24`}>
                  <MemoryBlock isSpookyActive={isSpookyActive} />
                </div>
              </div>
            )}

            {flickerWrap(
              <div className={`col-span-12 md:col-span-6 row-span-7 border ${THEME_BORDER} bg-black/80 ${THEME_GLOW} p-4 flex flex-col relative md:overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-6 bg-indigo-900/20 border-b border-indigo-500/30 flex items-center px-2">
                  <span className="text-xs font-bold">MAIN - bash</span>
                </div>

                {gameMode === 'pong' ? (
                  <div className="hidden md:flex flex-1 w-full h-full mt-6">
                    <PongGame onExit={handleGameExit} />
                  </div>
                ) : gameMode === 'snake' ? (
                  <div className="hidden md:flex flex-1 w-full h-full mt-6">
                    <SnakeGame onExit={handleGameExit} />
                  </div>
                ) : gameMode === 'chat' ? (
                  <div className="flex-1 w-full h-full mt-6">
                    <LiveChat onExit={handleGameExit} />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto mt-6 font-mono text-sm md:text-base leading-relaxed p-2">
                      {history.map((line) => (
                        <div key={line.id} className="mb-2 break-words whitespace-pre-wrap">
                          {line.type === MessageType.USER && (
                            <div className="text-indigo-300 opacity-90">{`> ${line.content}`}</div>
                          )}
                          {(line.type === MessageType.SYSTEM || line.type === MessageType.INFO || line.type === MessageType.CODE || line.type === MessageType.ERROR) && (
                            renderLineContent(line)
                          )}

                          {isIAmPlaying && (currentIAmSubtitle || !timedSubtitles.length) && (
                            <div className="absolute inset-x-4 bottom-16 md:bottom-12 flex justify-center pointer-events-none">
                              <div className="px-4 py-2 bg-black/80 border border-indigo-500/50 rounded text-indigo-100 text-xs md:text-sm shadow-[0_0_12px_rgba(99,102,241,0.45)]">
                                {currentIAmSubtitle || 'Add timed lyrics in I_AM_SUBTITLE inside easter_eggs.ts (format: Line text (m:ss)).'}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {isProcessing && <div className="animate-pulse">_ PROCESSING...</div>}
                      <div ref={terminalEndRef} />
                    </div>

                    { }
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

                    {!isBooting && (
                      <TerminalInput
                        onSubmit={handleCommand}
                        disabled={isProcessing || isGameActive}
                        autoFocusEnabled={!isGameActive}
                        disableNativeKeyboard={isGameActive}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {flickerWrap(
              <div className={`hidden md:flex col-span-3 row-span-7 border ${THEME_BORDER} ${THEME_BG} p-4 relative flex-col`}>
                <div className={`absolute top-0 right-0 text-[10px] px-1 font-bold ${isIAmPlaying ? 'bg-red-900/60 text-red-300 animate-pulse' : 'bg-indigo-900/40 text-indigo-300'
                  }`}>
                  {isSpookyActive ? 'COMPROMISED' : 'NETWORK STATUS'}
                </div>
                <div className="flex-1 flex items-center justify-center opacity-90">
                  <BinaryGlobeNetwork
                    networkLevel={networkLevel}
                    isVoicePlaying={isSpookyActive}
                    isIAmPlaying={isIAmPlaying}
                  />
                </div>
                <div className="h-24 shrink-0 border-t border-indigo-500/30 pt-2">
                  <div className="text-[10px] mb-1 text-indigo-300 font-bold">TRAFFIC ANALYSIS</div>
                  <TrafficGraph isSpookyActive={isSpookyActive} />
                </div>
              </div>
            )}

            {flickerWrap(
              <div className={`flex md:hidden col-span-12 border ${THEME_BORDER} ${THEME_BG} p-4 items-center justify-center overflow-hidden min-h-[180px]`}>
                <VirtualKeyboard isVoicePlaying={isSpookyActive} />
              </div>
            )}

            {flickerWrap(
              <div className={`col-span-12 md:col-span-5 row-span-3 border ${THEME_BORDER} ${THEME_BG} p-4`}>
                <FileExplorer isSpookyActive={isSpookyActive} />
              </div>
            )}

            {flickerWrap(
              <div className={`hidden md:flex col-span-7 row-span-3 border ${THEME_BORDER} ${THEME_BG} p-4 items-center justify-center overflow-hidden`}>
                <VirtualKeyboard isVoicePlaying={isSpookyActive} />
              </div>
            )}

          </div>

          {gameMode === 'tetris' && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
              <TetrisGame onExit={() => setGameMode('none')} />
            </div>
          )}

          {gameMode === 'pong' && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
              <PongGame onExit={() => setGameMode('none')} />
            </div>
          )}

          {gameMode === 'snake' && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
              <SnakeGame onExit={() => setGameMode('none')} />
            </div>
          )}

          {gameMode === 'pacman' && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
              <PacmanGame onExit={() => setGameMode('none')} />
            </div>
          )}
        </>
      )}

      {privacyOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-hidden">
          { }
          <div className="absolute inset-0 z-0 opacity-30">
            <MatrixRain />
          </div>

          { }
          <div className="absolute inset-0 z-0 pointer-events-none flex justify-between items-center px-8 md:px-12 opacity-40 text-indigo-500 font-mono text-xs md:text-xl leading-none whitespace-pre select-none origin-center">
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

          <div className={`w-full max-w-2xl min-h-[60vh] flex flex-col justify-between border-2 ${THEME_BORDER} bg-black/80 p-8 relative ${THEME_GLOW} z-10 backdrop-blur-md`}>
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

            <div className="mb-12 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center relative">
                <div className="text-xs mb-2 opacity-70 uppercase tracking-widest">Biometric Scan</div>
                <FingerprintScanner onScanComplete={handleScanComplete} isComplete={isFingerprintVerified} />
              </div>
            </div>

            <button
              onClick={handleAcknowledge}
              disabled={!isFingerprintVerified}
              className={`w-full border ${THEME_BORDER} ${isFingerprintVerified ? 'bg-indigo-500/20 hover:bg-indigo-500 hover:text-black cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'opacity-50 cursor-not-allowed'} px-6 py-3 transition-all uppercase font-bold tracking-wider`}
            >
              {isFingerprintVerified ? 'ACKNOWLEDGE & ENTER SYSTEM' : 'VERIFICATION REQUIRED'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
