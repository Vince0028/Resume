import { Linkedin } from 'lucide-react';

const FooterSection = () => (
  <footer className="border-t border-border py-8 px-6">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground font-mono">© 2026 Vince Nelmar Alobin</p>
      <div className="flex items-center gap-6 text-sm font-mono text-muted-foreground">
        <a href="#experience" className="hover:text-foreground transition-colors">
          Experience
        </a>
        <a href="#skills" className="hover:text-foreground transition-colors">
          Skills
        </a>
        <a href="#terminal" className="hover:text-foreground transition-colors">
          Terminal
        </a>
        <a href="https://www.linkedin.com/in/vince-nelmar-alobin-26a361321" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" title="LinkedIn">
          <Linkedin size={16} />
        </a>
      </div>
    </div>
  </footer>
);

export default FooterSection;
