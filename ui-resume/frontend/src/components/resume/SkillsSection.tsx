import SectionHeader from './SectionHeader';
import { Terminal, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import Robot from './Robot';

const skillCategories = [
  {
    label: 'Languages',
    skills: [
      { name: 'Python', logo: 'python', color: '#3776AB' },
      { name: 'TypeScript', logo: 'typescript', color: '#3178C6' },
      { name: 'JavaScript', logo: 'javascript', color: '#F7DF1E' },
      { name: 'Dart', logo: 'dart', color: '#0175C2' },
      { name: 'Kotlin', logo: 'kotlin', color: '#7F52FF' },
      { name: 'C++', logo: 'cplusplus', color: '#00599C' },
      { name: 'Java', logo: 'java', color: '#f89820' },
      { name: 'HTML5', logo: 'html5', color: '#E34F26' },
      { name: 'CSS3', logo: 'css3', color: '#1572B6' },
    ],
  },
  {
    label: 'Frameworks & AI / CV',
    skills: [
      { name: 'React', logo: 'react', color: '#61DAFB' },
      { name: 'Next.js', logo: 'nextdotjs', color: '#000000' },
      { name: 'Flutter', logo: 'flutter', color: '#02569B' },
      { name: 'OpenCV', logo: 'opencv', color: '#5C3EE8' },
      { name: 'Flask', logo: 'flask', color: '#000000' },
      { name: 'Node.js', logo: 'nodedotjs', color: '#339933' },
      { name: 'Tailwind CSS', logo: 'tailwindcss', color: '#06B6D4' },
    ],
  },
  {
    label: 'Database & Cloud DevOps',
    skills: [
      { name: 'Supabase', logo: 'supabase', color: '#3ECF8E' },
      { name: 'PostgreSQL', logo: 'postgresql', color: '#4169E1' },
      { name: 'MySQL', logo: 'mysql', color: '#4479A1' },
      { name: 'Docker', logo: 'docker', color: '#2496ED' },
      { name: 'AWS', logo: 'amazonwebservices', color: '#232F3E' },
      { name: 'Azure', logo: 'microsoftazure', color: '#0078D4' },
      { name: 'Vercel', logo: 'vercel', color: '#000000' },
    ],
  },
  {
    label: 'Hardware & IoT Prototyping',
    skills: [
      { name: 'Arduino', logo: 'arduino', color: '#00979D' },
      { name: 'Raspberry Pi', logo: 'raspberrypi', color: '#A22846' },
      { name: 'Git', logo: 'git', color: '#F05032' },
      { name: 'GitHub', logo: 'github', color: '#181717' },
      { name: 'VS Code', logo: 'visualstudiocode', color: '#007ACC' },
      { name: 'Figma', logo: 'figma', color: '#F24E1E' },
    ],
  },
];

interface SkillsSectionProps {
  className?: string;
  isDarkMode?: boolean;
  isTransition?: boolean;
}

const SkillsSection = ({ className = "", isDarkMode = true, isTransition = false }: SkillsSectionProps) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section id="skills" className={`py-24 ${className}`}>
      <div className="px-6 max-w-7xl mx-auto">
        <SectionHeader number="04" title="Skills" />

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left Column: 3D Robot (Desktop Only) — skip during theme transition to avoid lag.
              We intentionally DO NOT use ScrollReveal here. GSAP's autoAlpha applies 'visibility: hidden',
              which blocks Spline's internal IntersectionObserver from pre-loading the WebGL context. 
              By letting it remain visible to the DOM, it parses in the background without causing a scroll stutter! */}
          <div className="hidden lg:block lg:col-span-2 sticky top-24 z-[55]">
            <div className="bg-[#0B1120]/30 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-sm h-[600px] w-full">
              {!isTransition ? (
                <Robot />
              ) : (
                <div className="h-[600px] w-full flex items-center justify-center text-muted-foreground">Loading model...</div>
              )}
            </div>
          </div>

          {/* Right Column: Skills List */}
          <div className="lg:col-span-3 space-y-12">
            {/* Scanline header bar */}
            <ScrollReveal direction="up" delay={0.1}>
              <div className="flex items-center gap-3 mb-10 font-mono text-xs text-muted-foreground">
                <Terminal size={12} className="text-primary" />
                <span className="text-primary">&gt;</span>
                <span className="tracking-widest uppercase">tech_stack.config</span>
                <span className="flex-1 border-b border-dashed border-border" />
                <span className="text-primary/60">
                  {skillCategories.reduce((a, c) => a + c.skills.length, 0)} loaded
                </span>
              </div>
            </ScrollReveal>

            <div className="space-y-10">
              {skillCategories.map((cat, catIdx) => (
                <div key={cat.label}>
                  {/* Category label */}
                  <ScrollReveal direction="left" delay={0.2 + (catIdx * 0.1)}>
                    <div className="flex items-center gap-2 mb-4">
                      <ChevronRight size={14} className="text-primary" />
                      <span className="font-mono text-xs tracking-widest uppercase text-primary/80">
                        {cat.label}
                      </span>
                      <span className="flex-1 border-b border-dashed border-border/40" />
                    </div>
                  </ScrollReveal>

                  {/* Skill badges */}
                  <ScrollReveal isStaggeredChildren stagger={0.1} delay={0.3 + (catIdx * 0.1)} className="flex flex-wrap gap-3">
                    {cat.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className={`
                          relative group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 cursor-default overflow-hidden
                          ${hoveredSkill === skill.name
                            ? 'border-primary/50 bg-card shadow-[0_0_16px_rgba(212,132,26,0.08)]'
                            : 'border-border bg-card/50 hover:border-border/80'
                          }
                        `}
                        onMouseEnter={() => setHoveredSkill(skill.name)}
                        onMouseLeave={() => setHoveredSkill(null)}
                      >
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20" />

                        {/* GPRM logo */}
                        <img
                          src={`https://img.shields.io/badge/${encodeURIComponent(skill.name)}-${skill.color.replace('#', '')}?style=for-the-badge&logo=${skill.logo}&logoColor=white`}
                          alt={skill.name}
                          className="h-7 rounded-sm"
                          loading="lazy"
                        />

                        {/* Glow bar on hover */}
                        {hoveredSkill === skill.name && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${skill.color}80, transparent)` }}
                          />
                        )}

                        {/* Scanline overlay on hover */}
                        {hoveredSkill === skill.name && (
                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.04]"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(35,90%,55%) 2px, hsl(35,90%,55%) 3px)',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </ScrollReveal>
                </div>
              ))}
            </div>

            {/* Bottom terminal line */}
            <div className="flex items-center gap-2 mt-10 font-mono text-xs text-muted-foreground/40">
              <span className="text-primary/40">&gt;</span>
              <span className="tracking-widest">stack loaded successfully</span>
              <span className="flex-1 border-b border-dashed border-border/40" />
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
