import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggle: (e: React.MouseEvent) => void;
  hideControls?: boolean;
}

const getSimpleResumeUrl = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return '../../html/simple_portfolio.html';
  }
  return '/simple_portfolio.html';
};

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Simple', href: getSimpleResumeUrl() },
  { label: 'Contact', href: '#terminal' },
];

/**
 * Shaped bottom edge SVG — mirrors the reference image's curved/angular navbar underline.
 * The path starts flat on the left, angles down to a center notch, then back up flat on the right.
 */
const NavEdge = () => (
  <div className="absolute left-0 right-0 top-full w-full overflow-visible pointer-events-none" style={{ height: 18 }}>
    <svg
      viewBox="0 0 1200 18"
      preserveAspectRatio="none"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background fill so the shaped area matches navbar bg */}
      <path
        d="M0,0 L460,0 L480,12 L720,12 L740,0 L1200,0 L1200,0 L0,0 Z"
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

const Navbar = ({ isDarkMode, onToggle, hideControls = false }: NavbarProps) => (
  <nav className="relative bg-background/90 backdrop-blur-sm transition-colors duration-1000">
    <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
      {/* Left nav links */}
      <div className={`hidden md:flex items-center gap-10 flex-1 ${hideControls ? 'opacity-0 pointer-events-none' : ''}`}>
        {navLinks.slice(0, 2).map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-mono text-sm font-semibold tracking-widest text-foreground/80 hover:text-primary transition-all duration-1000 uppercase"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Center — Logo + Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center transition-colors duration-1000">
          <span className="font-mono font-bold text-sm text-primary transition-colors duration-1000">VNA</span>
        </div>
      </div>

      {/* Right nav links + theme toggle */}
      <div className={`hidden md:flex items-center gap-10 flex-1 justify-end ${hideControls ? 'opacity-0 pointer-events-none' : ''}`}>
        {navLinks.slice(2).map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-mono text-sm font-semibold tracking-widest text-foreground/80 hover:text-primary transition-all duration-1000 uppercase"
          >
            {link.label}
          </a>
        ))}
        <button
          onClick={(e) => { (e.currentTarget as HTMLElement).blur(); onToggle(e); }}
          tabIndex={-1}
          className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all duration-1000"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun size={16} className="text-primary transition-colors duration-1000" />
          ) : (
            <Moon size={16} className="text-primary transition-colors duration-1000" />
          )}
        </button>
      </div>

      {/* Mobile: theme toggle only */}
      <button
        onClick={(e) => { (e.currentTarget as HTMLElement).blur(); onToggle(e); }}
        tabIndex={-1}
        className={`md:hidden w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-all duration-1000 ${hideControls ? 'opacity-0 pointer-events-none' : ''
          }`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun size={16} className="text-primary" />
        ) : (
          <Moon size={16} className="text-primary" />
        )}
      </button>
    </div>

    {/* Shaped bottom edge — tech/angular dip in center */}
    <NavEdge />
  </nav>
);

export default Navbar;
