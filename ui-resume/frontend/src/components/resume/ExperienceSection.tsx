import { Briefcase, GraduationCap, ChevronRight, Terminal } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';
import LightRays from './LightRays';
import { useState } from 'react';

const experiences = [
  {
    period: '2024 - Present',
    title: 'Division Science and Technology Fair (DSTF) — Technical Lead',
    description:
      'Designed and deployed award-level projects including an AI dengue risk assessment tool (DengueTect) and retailer analytics platform (AnaLytics) live on Vercel. Led end-to-end lifecycle across AI, hardware, and web.',
    icon: <Briefcase size={14} />,
    tags: ['Technical Lead', 'DengueTect', 'AnaLytics', 'AI / CV', 'Vercel'],
    status: 'ACTIVE',
  },
  {
    period: '2024 - Present',
    title: 'BS Information Technology — Asia Pacific College (APC)',
    description:
      'Pursuing BSIT focusing on full-stack web, mobile architectures, cloud, and AI engineering. Coursework in WebProg, MobProg, Data Structures, and Data Management.',
    icon: <GraduationCap size={14} />,
    tags: ['BSIT', 'React', 'Flutter', 'TypeScript', 'Supabase', 'Python'],
    status: 'ACTIVE',
  },
  {
    period: '2024 - Present',
    title: 'Academic Project Developer — APC Capstones',
    description:
      'Engineered subject capstones including a Hotel Reservation System, AI-powered budget tracker (BETA), Flutter Resume Ranking app, and webcam Hand Gesture Recognition.',
    icon: <Terminal size={14} />,
    tags: ['Full Stack', 'OpenCV', 'Gemini AI', 'Flask', 'PostgreSQL'],
    status: 'ACTIVE',
  },
  {
    period: '2022 - 2024',
    title: 'Senior High School — STEM Strand (With Honors & TESDA NC2)',
    description:
      'Graduated STEM strand with academic honors from Pasay City South High School. Earned TESDA National Certificate II (NC2) in Animation.',
    icon: <GraduationCap size={14} />,
    tags: ['STEM', 'Academic Honors', 'TESDA NC2', 'Computer Animation'],
    status: 'COMPLETED',
  },
];

interface ExperienceSectionProps {
  className?: string;
  isDarkMode?: boolean;
}

const ExperienceSection = ({ className = "", isDarkMode = true }: ExperienceSectionProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Light colors based on theme
  const lightColor = isDarkMode ? "bg-amber-300/95" : "bg-blue-400/95";
  const lightShadow = isDarkMode
    ? "shadow-[0_0_20px_8px_rgba(212,132,26,0.6),0_0_60px_20px_rgba(212,132,26,0.25),0_0_100px_40px_rgba(212,132,26,0.1)]"
    : "shadow-[0_0_20px_8px_rgba(59,130,246,0.6),0_0_60px_20px_rgba(59,130,246,0.25),0_0_100px_40px_rgba(59,130,246,0.1)]";
  const rayColor = isDarkMode ? "#d4841a" : "#60a5fa";

  return (
    <section id="experience" className={`pt-32 pb-24 relative overflow-hidden ${className}`}>
      {/* Hanging industrial lamp — flush on top edge, no rod */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        {/* Lamp shade — wide, sits right on the edge */}
        <div className="relative">
          <svg width="320" height="60" viewBox="0 0 320 60" className="drop-shadow-lg">
            <path d="M90 0 H230 L310 50 Q315 58 308 58 H12 Q5 58 10 50 Z" fill="url(#shade-grad)" stroke="#555" strokeWidth="1" />
            <path d="M95 4 H225 L302 50 H18 Z" fill="rgba(0,0,0,0.3)" />
            <defs>
              <linearGradient id="shade-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5a5a5a" />
                <stop offset="60%" stopColor="#3a3a3a" />
                <stop offset="100%" stopColor="#2a2a2a" />
              </linearGradient>
            </defs>
          </svg>
          {/* Bulb */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            <div className={`w-5 h-5 rounded-full ${lightColor} ${lightShadow} transition-all duration-1000`} />
          </div>
        </div>
      </div>

      {/* LightRays — starts from lamp bottom edge */}
      <div className="absolute left-0 right-0 bottom-0 opacity-40 pointer-events-none" style={{ top: '55px' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor={rayColor}
          raysSpeed={0.6}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={0.8}
        />
      </div>

      <div className="relative z-10 px-6 max-w-4xl mx-auto">
        <SectionHeader number="01" title="Experience" />

        {/* Scanline header bar */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-center gap-3 mb-8 font-mono text-xs text-muted-foreground">
            <Terminal size={12} className="text-primary" />
            <span className="text-primary">&gt;</span>
            <span className="tracking-widest uppercase">system.log</span>
            <span className="flex-1 border-b border-dashed border-border" />
            <span className="text-primary/60">{experiences.length} entries</span>
          </div>
        </ScrollReveal>

        <div className="relative ml-2">
          {/* Timeline line — glowing */}
          <div className="absolute left-3 top-0 bottom-0 w-px">
            <div className="absolute inset-0 bg-primary/30" />
            <div className="absolute inset-0 bg-primary/10 blur-sm w-1 -translate-x-[1px]" />
          </div>

          {experiences.map((exp, i) => (
            <ScrollReveal direction="up" delay={0.3 + (i * 0.15)} key={i}>
              <div
                className="relative pl-12 pb-12 last:pb-0 group"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Timeline node */}
                <div className={`
                absolute left-0 top-1 w-7 h-7 rounded border
                flex items-center justify-center transition-all duration-300
                ${hoveredIdx === i
                    ? 'border-primary bg-primary/20 text-primary shadow-[0_0_12px_hsl(35,90%,55%,0.3)]'
                    : 'border-border bg-card text-muted-foreground'
                  }
              `}>
                  {exp.icon}
                </div>

                {/* Card */}
                <div className={`
                relative border rounded-lg p-5 transition-all duration-300 overflow-hidden
                ${hoveredIdx === i
                    ? 'border-primary/40 bg-card shadow-[0_0_20px_hsl(35,90%,55%,0.06)]'
                    : 'border-border bg-card/50'
                  }
              `}>
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/30" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/30" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/30" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/30" />

                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className="text-primary" />
                      <span className="font-mono text-xs text-primary tracking-wider">{exp.period}</span>
                    </div>
                    <span className={`
                    font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm border
                    ${exp.status === 'ACTIVE'
                        ? 'text-green-400 border-green-400/30 bg-green-400/5'
                        : 'text-muted-foreground border-border bg-muted/30'
                      }
                  `}>
                      {exp.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {exp.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                    {exp.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm border border-border bg-secondary/50 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Subtle scanline overlay on hover */}
                  {hoveredIdx === i && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(35,90%,55%) 2px, hsl(35,90%,55%) 3px)',
                      }}
                    />
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom terminal line */}
        <div className="flex items-center gap-2 mt-8 font-mono text-xs text-muted-foreground/40">
          <span className="text-primary/40">&gt;</span>
          <span className="tracking-widest">EOF</span>
          <span className="flex-1 border-b border-dashed border-border/40" />
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
