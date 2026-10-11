import ScrollReveal from '../ui/ScrollReveal';

interface SectionHeaderProps {
  number: string;
  title: string;
}

const SectionHeader = ({ number, title }: SectionHeaderProps) => (
  <ScrollReveal direction="down" duration={0.8} delay={0.1}>
    <div className="mb-12">
      <span className="font-mono text-sm text-primary tracking-widest">[ {number} ]</span>
      <h2 className="text-4xl md:text-5xl font-bold mt-2 text-foreground">{title}</h2>
    </div>
  </ScrollReveal>
);

export default SectionHeader;
