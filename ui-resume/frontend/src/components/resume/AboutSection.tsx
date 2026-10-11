import SectionHeader from './SectionHeader';
import ProfileCard from './ProfileCard';
import ScrollReveal from '../ui/ScrollReveal';

interface AboutSectionProps {
  className?: string;
}

const AboutSection = ({ className = '' }: AboutSectionProps) => (
  <section id="about" className={`py-24 ${className}`}>
    <div className="px-6 max-w-5xl mx-auto">
      <SectionHeader number="00" title="About Me" />

      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Left: ProfileCard */}
        <ScrollReveal className="md:w-2/5 flex-shrink-0 flex justify-center relative" direction="right" delay={0.2}>
          {/* Decorative corner accents */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-sm z-10" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-sm z-10" />
          <ProfileCard
            name="Vince Nelmar Alobin"
            title="BSIT • Full Stack Developer"
            handle="Vince0028"
            status="Online"
            contactText="Contact Me"
            avatarUrl={`${import.meta.env.BASE_URL}images/resto.png`}
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => window.location.href = '#terminal'}
            behindGlowColor="rgba(125, 190, 255, 0.67)"
            behindGlowEnabled
            innerGradient="linear-gradient(145deg,#1e1b4b8c 0%,#3b82f644 100%)"
          />
        </ScrollReveal>

        {/* Right: About text */}
        <div className="md:w-3/5">
          <ScrollReveal direction="up" isStaggeredChildren stagger={0.15}>
            <h3 className="font-mono text-sm tracking-[0.3em] text-primary mb-4 uppercase">
              Who I Am
            </h3>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              Hey! I'm <span className="text-primary font-semibold">Vince Nelmar Alobin</span>, a motivated
              BS Information Technology student from Pasay City, Philippines who genuinely enjoys engineering full-stack solutions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Currently studying at <span className="text-foreground font-medium">Asia Pacific College (APC)</span>, I build across diverse ecosystems — from modern reactive web apps (React, Next.js, Vite, TypeScript) and mobile platforms (Flutter) to backend architectures (Node.js, Flask, Supabase) and real-time computer vision systems (OpenCV, Python).
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Passionate about shipping end-to-end products, AI integrations (Gemini, LLMs), and continuous growth — backed by 40+ professional industry certifications in Cloud, AI, and Cybersecurity.
            </p>
          </ScrollReveal>

          {/* Quick stats */}
          <ScrollReveal direction="up" isStaggeredChildren delay={0.4} stagger={0.2} className="grid grid-cols-3 gap-6 border-t border-border pt-6">
            <div>
              <span className="block text-2xl font-bold text-primary font-mono">40+</span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Certifications</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-primary font-mono">15+</span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Projects</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-primary font-mono">100%</span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Commitment</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
