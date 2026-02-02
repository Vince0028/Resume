
import React, { useState } from 'react';
import { askOracle } from '../services/geminiService';
import { OracleMessage } from '../types';

const MainContent: React.FC = () => {
  const [messages, setMessages] = useState<OracleMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    const userMsg: OracleMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await askOracle(input);
    const modelMsg: OracleMessage = { role: 'model', text: response };
    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  // Organic, hand-tuned border radius for non-perfect shapes
  const organicBorder = '12px 28px 14px 32px / 28px 12px 32px 14px';
  const smallOrganicBorder = '8px 14px 7px 16px / 14px 8px 16px 7px';

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-slate-400 p-7 md:p-14 selection:bg-amber-900/30 font-sans tracking-tight">
      <header className="max-w-6xl mx-auto flex justify-between items-start mb-20 px-2">
        <div className="group cursor-default">
          <h1 className="text-3xl text-amber-700/60 font-medium tracking-[0.4em] transition-all duration-700 group-hover:tracking-[0.5em]" style={{ fontFamily: 'serif' }}>SANCTUM</h1>
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] mt-2 ml-1">The Sorcerer's Mirror</p>
        </div>
        <nav className="hidden md:flex gap-12 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500/80">
          <a href="#" className="hover:text-amber-700/50 transition-all duration-500 hover:translate-y-[-1px]">Codex</a>
          <a href="#" className="hover:text-amber-700/50 transition-all duration-500 hover:translate-y-[-1px]">Reliquary</a>
          <a href="#" className="hover:text-amber-700/50 transition-all duration-500 hover:translate-y-[-1px]">Thresholds</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Artifacts */}
        <section className="lg:col-span-2 space-y-12">
          <div 
            className="bg-slate-900/10 border border-slate-800/40 p-9 shadow-2xl backdrop-blur-xl transition-all duration-1000 hover:bg-slate-900/20"
            style={{ borderRadius: organicBorder }}
          >
            <h2 className="text-xl text-slate-300/80 mb-9 font-light tracking-widest">Wards & Eldritch Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {[
                { name: 'Mirror Dimension', status: 'In Flux', intensity: '88%' },
                { name: 'Eye of Agamotto', status: 'Dormant', intensity: '0%' },
                { name: 'Shield of Seraphim', status: 'Waning', intensity: '42%' },
                { name: 'Crimson Bands', status: 'Binding', intensity: '12%' },
              ].map((spell) => (
                <div 
                  key={spell.name} 
                  className="group p-5 bg-slate-950/20 border border-slate-900/40 flex justify-between items-center transition-all duration-500 hover:border-amber-900/20"
                  style={{ borderRadius: smallOrganicBorder, transform: `rotate(${Math.random() * 0.4 - 0.2}deg)` }}
                >
                  <div className="ml-1">
                    <p className="text-slate-200/90 text-sm font-light tracking-wide">{spell.name}</p>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">{spell.status}</p>
                  </div>
                  <div className="text-right mr-1">
                    <p className="text-amber-800/40 font-mono text-xs group-hover:text-amber-700/60 transition-colors duration-700">{spell.intensity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-11 ml-1">
            <div 
              className="bg-slate-900/10 border border-slate-800/40 p-9 transition-all duration-1000 hover:rotate-1"
              style={{ borderRadius: organicBorder }}
            >
              <h3 className="text-lg text-slate-300/70 mb-5 font-light tracking-wide">Astral Echoes</h3>
              <p className="text-slate-500/80 text-sm leading-relaxed mb-7 font-light">
                The veil is thin. Resonance detected across fourteen distinct timelines. Synchronization is required.
              </p>
              <button 
                className="px-8 py-3 bg-slate-800/20 border border-slate-700/30 hover:bg-slate-800/40 text-slate-500 text-[9px] uppercase tracking-[0.3em] transition-all duration-500 hover:text-amber-800/50"
                style={{ borderRadius: smallOrganicBorder }}
              >
                Harmonize Veil
              </button>
            </div>
            <div 
              className="bg-slate-900/10 border border-slate-800/40 p-9 transition-all duration-1000 hover:rotate-[-1deg]"
              style={{ borderRadius: organicBorder }}
            >
              <h3 className="text-lg text-slate-300/70 mb-5 font-light tracking-wide">Planar Integrity</h3>
              <div className="h-[1px] w-full bg-slate-800/30 mb-6">
                <div className="h-full bg-amber-900/20 w-[64%] transition-all duration-1000 delay-300" />
              </div>
              <ul className="space-y-2 text-[9px] text-slate-600 uppercase tracking-[0.2em]">
                <li className="flex justify-between"><span>London</span> <span className="text-emerald-900/40">Secured</span></li>
                <li className="flex justify-between"><span>Hong Kong</span> <span className="text-rose-900/40">Distorted</span></li>
                <li className="flex justify-between"><span>New York</span> <span className="text-emerald-900/40">Secured</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Right Column: The Oracle */}
        <aside 
          className="bg-slate-950/40 border border-slate-900/60 p-7 flex flex-col h-[680px] shadow-2xl relative lg:mt-3"
          style={{ borderRadius: organicBorder }}
        >
          <div className="flex items-center gap-5 mb-9 border-b border-slate-900/80 pb-6 px-1">
            <div className="w-1 h-1 rounded-full bg-amber-900/30 animate-pulse shadow-[0_0_8px_rgba(120,53,15,0.2)]" />
            <h3 className="text-xs text-amber-800/60 font-bold tracking-[0.4em] uppercase">Scry the Oracle</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-8 mb-9 pr-3 custom-scrollbar px-1">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-slate-800 to-transparent mb-6" />
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] italic">
                  Whisper to the Mirror...
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-700`}>
                <div 
                  className={`max-w-[92%] p-5 text-[13px] font-light leading-relaxed tracking-wide transition-all duration-500 ${
                    m.role === 'user' 
                      ? 'bg-amber-950/5 text-amber-200/50 border border-amber-900/10 ml-6' 
                      : 'bg-slate-900/30 text-slate-400 border border-slate-800/40 mr-6'
                  }`}
                  style={{ borderRadius: m.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px' }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start px-2">
                <div className="text-slate-600 text-[9px] uppercase tracking-[0.5em] animate-pulse">
                  Observing...
                </div>
              </div>
            )}
          </div>

          <div className="relative mt-auto px-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Query the multi-verse..."
              className="w-full bg-transparent border-b border-slate-900/80 py-4 text-xs text-slate-300/90 focus:outline-none focus:border-amber-950/50 transition-all duration-700 placeholder:text-slate-800 placeholder:uppercase placeholder:tracking-[0.2em]"
            />
            <button 
              onClick={handleAsk}
              className="absolute right-1 bottom-4 p-2 text-slate-800 hover:text-amber-900/40 transition-all duration-500 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto mt-28 border-t border-slate-900/30 pt-12 pb-16 flex flex-col md:flex-row justify-between items-center text-[9px] text-slate-700 uppercase tracking-[0.3em]">
        <p className="font-light">© 2024 Ancient One's Archive. No unauthorized scrying.</p>
        <div className="flex gap-14 mt-8 md:mt-0">
          <a href="#" className="hover:text-amber-950 transition-colors duration-500">Privacy Leylines</a>
          <a href="#" className="hover:text-amber-950 transition-colors duration-500">Interdimensional Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default MainContent;
