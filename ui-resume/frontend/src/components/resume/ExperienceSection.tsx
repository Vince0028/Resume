import { Briefcase, GraduationCap, ChevronRight, Terminal } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';
import LightRays from './LightRays';
import { useState } from 'react';

interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  subtitle?: string;
  description?: string;
  bullets?: string[];
  icon: React.ReactNode;
  tags: string[];
  status: 'ACTIVE' | 'COMPLETED';
}

const experiences: ExperienceItem[] = [
  {
    period: 'Sep 10 – 20, 2026',
    role: 'DevOps & Web Developer',
    company: 'APC-NAMFREL BARMM Election Monitoring Portal',
    subtitle: 'Bangsamoro Parliamentary Elections Monitoring | DevOps, CI/CD, Database Caching',
    bullets: [
      'Served as a specialized web developer and DevOps engineer supporting the high-profile Bangsamoro Parliamentary Elections monitoring portal viewed and monitored nationwide.',
      'Architected automated CI/CD deployment pipelines and implemented multi-layer database caching strategies to ensure horizontal scalability, zero downtime, and instant query responsiveness under peak nationwide voting traffic.',
    ],
    icon: <Briefcase size={14} />,
    tags: ['DevOps', 'CI/CD', 'Database Caching', 'PostgreSQL', 'NAMFREL', 'APC', 'High Traffic Architecture'],
    status: 'COMPLETED',
  },
  {
    period: 'Aug 2025 – Oct 2025',
    role: 'Lead Developer',
    company: 'PCSHS • Division Science and Technology Fair (DSTF)',
    subtitle: 'Division Science and Technology Fair (DSTF) | Python, React, Next.js, Arduino, Raspberry Pi',
    bullets: [
      'Built all 4 competition projects from start to finish, serving as the sole programmer and technical lead across 4 separate teams with a total of 15 researchers.',
      'DengueTect: AI-powered dengue risk assessment and health diagnostic web application.',
      'AnaLytics: Real-time retail inventory and foot-traffic analytics dashboard.',
      'Driver Expression Detector: Computer vision vehicle safety camera monitoring driver fatigue and facial expressions.',
      'SmartShut: IoT automated intelligent smart lighting and sensor-driven enclosure system.',
    ],
    icon: <Terminal size={14} />,
    tags: ['Lead Developer', 'Python', 'React', 'Next.js', 'Arduino', 'Raspberry Pi', 'OpenCV', 'IoT'],
    status: 'COMPLETED',
  },
  {
    period: '2024 – Present',
    role: 'BS Information Technology',
    company: 'Asia Pacific College (APC)',
    subtitle: 'Specializing in Full-Stack Web, Mobile Architectures & AI Systems',
    bullets: [
      'Pursuing Bachelor of Science in Information Technology focusing on modern reactive web ecosystems, mobile platforms, backend architectures, and computer vision systems.',
      'Backed by 40+ professional industry certifications in Cloud Computing, Artificial Intelligence, and Cybersecurity.',
    ],
    icon: <GraduationCap size={14} />,
    tags: ['BSIT', 'Asia Pacific College', 'React', 'Flutter', 'TypeScript', 'Supabase', 'Python'],
    status: 'ACTIVE',
  },
  {
    period: '2022 – 2024',
    role: 'Senior High School — STEM Strand',
    company: 'Pasay City South High School (PCSHS)',
    subtitle: 'Graduated With Academic Honors • TESDA National Certificate II (NC2)',
    bullets: [
      'Graduated with Academic Honors under the Science, Technology, Engineering, and Mathematics (STEM) strand.',
      'Earned TESDA National Certificate II (NC2) in Computer Animation and 2D Digital Design.',
    ],
    icon: <GraduationCap size={14} />,
    tags: ['STEM', 'Academic Honors', 'TESDA NC2', 'Computer Animation', 'PCSHS'],
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

                  {/* Role Title & Organization */}
                  <div className="mb-2.5">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 flex items-baseline gap-2 flex-wrap">
                      <span>{exp.role}</span>
                      <span className="text-xs font-mono font-normal text-primary/80">@ {exp.company}</span>
                    </h3>
                    {exp.subtitle && (
                      <p className="font-mono text-xs text-muted-foreground mt-0.5 tracking-wide">
                        {exp.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bullets or Description */}
                  {exp.bullets && exp.bullets.length > 0 ? (
                    <ul className="space-y-2 mb-4 max-w-2xl text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 [ .theme-light_& ]:text-zinc-800 [ .theme-dark_& ]:text-zinc-200">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="text-primary text-xs mt-1 select-none font-mono">▸</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed mb-4 max-w-2xl text-zinc-800 dark:text-zinc-200 [ .theme-light_& ]:text-zinc-800 [ .theme-dark_& ]:text-zinc-200">
                      {exp.description}
                    </p>
                  )}

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
