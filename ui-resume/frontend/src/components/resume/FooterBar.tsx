/**
 * Top edge SVG — the notch dips DOWN, matching the header's downward curve.
 */
const FooterEdge = () => (
  <div className="absolute left-0 right-0 bottom-full w-full overflow-visible pointer-events-none" style={{ height: 18 }}>
    <svg
      viewBox="0 0 1200 18"
      preserveAspectRatio="none"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background fill — covers from the line downward to connect with footer bg */}
      <path
        d="M0,0 L460,0 L480,12 L720,12 L740,0 L1200,0 L1200,18 L0,18 Z"
        className="fill-background/90 transition-colors duration-1000"
      />
      {/* Visible border line */}
      <path
        d="M0,0 L460,0 L480,12 L720,12 L740,0 L1200,0"
        fill="none"
        className="stroke-primary/30 transition-colors duration-1000"
        strokeWidth="1.5"
      />
      {/* Accent glow on the center dip */}
      <path
        d="M460,0 L480,12 L720,12 L740,0"
        fill="none"
        className="stroke-primary/50 transition-colors duration-1000"
        strokeWidth="2"
      />
    </svg>
  </div>
);

import { Linkedin, Github } from 'lucide-react';

const footerLinks = [
  { label: 'Resume', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Terminal', href: '#terminal' },
];

interface FooterBarProps {
  minimal?: boolean;
}

const FooterBar = ({ minimal = false }: FooterBarProps) => (
  <footer className="relative bg-background/90 backdrop-blur-sm transition-colors duration-1000">
    <FooterEdge />

    <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
      {/* Left: copyright */}
      <div className="hidden md:flex items-center flex-1">
        <span className="font-mono text-xs tracking-widest text-foreground/50 uppercase transition-colors duration-1000">
          &copy; 2026 Vince Nelmar Alobin
        </span>
      </div>

      {/* Center: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center transition-colors duration-1000">
          <span className="font-mono font-bold text-sm text-primary transition-colors duration-1000">VNA</span>
        </div>
      </div>

      {/* Right: links + socials (hidden in minimal/intro mode) */}
      {!minimal ? (
        <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-xs font-semibold tracking-widest text-foreground/50 hover:text-primary transition-all duration-1000 uppercase"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 ml-2">
            <a href="https://www.linkedin.com/in/vince-nelmar-alobin-26a361321" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-primary transition-colors duration-1000" title="LinkedIn">
              <Linkedin size={14} />
            </a>
            <a
              href="https://github.com/Vince0028"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/40 hover:text-primary transition-colors duration-1000"
              title="GitHub"
            >
              <Github size={14} />
            </a>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1" />
      )}

      {/* Mobile: just copyright */}
      <span className="md:hidden font-mono text-xs text-foreground/50 transition-colors duration-1000">
        &copy; 2026
      </span>
    </div>
  </footer>
);

export default FooterBar;
