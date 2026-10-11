import SectionHeader from './SectionHeader';
import ChromaGrid from '@/components/ui/ChromaGrid';
import ScrollReveal from '../ui/ScrollReveal';

const galleryItems = [
  {
    image: `${import.meta.env.BASE_URL}images/resto.png`,
    title: 'Vince Nelmar Alobin',
    subtitle: 'Lead Developer • BSIT',
    borderColor: '#6366F1',
    gradient: 'linear-gradient(145deg, #6366F1 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/honor.jpg`,
    title: 'APC Honor Award',
    subtitle: 'Academic Excellence Recognition',
    borderColor: '#10B981',
    gradient: 'linear-gradient(165deg, #10B981 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/grad.png`,
    title: 'STEM Graduation',
    subtitle: 'With Honors • Senior High School',
    borderColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/denguetech.png`,
    title: 'DengueTect (DSTF)',
    subtitle: 'AI & Computer Vision Health Tool',
    borderColor: '#EF4444',
    gradient: 'linear-gradient(195deg, #EF4444 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/NC2 cert.png`,
    title: 'TESDA NC2 Animation',
    subtitle: 'National Qualification Credential',
    borderColor: '#8B5CF6',
    gradient: 'linear-gradient(225deg, #8B5CF6 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/AnaLytics.png`,
    title: 'AnaLytics Platform',
    subtitle: 'Rice Retailer Storefront & Waste Tracker',
    borderColor: '#06B6D4',
    gradient: 'linear-gradient(115deg, #06B6D4 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/VeriFace.png`,
    title: 'VeriFace Attendance',
    subtitle: 'Computer Vision Facial Recognition',
    borderColor: '#EC4899',
    gradient: 'linear-gradient(155deg, #EC4899 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/gala.jpg`,
    title: 'Campus & Social',
    subtitle: 'Tech Community & Milestones',
    borderColor: '#F97316',
    gradient: 'linear-gradient(175deg, #F97316 0%, #0f0f1a 100%)',
  },
  {
    image: `${import.meta.env.BASE_URL}images/Lanyard_dizzy.png`,
    title: 'Pokemon ID Card',
    subtitle: 'Interactive 3D Lanyard Card',
    borderColor: '#84CC16',
    gradient: 'linear-gradient(210deg, #84CC16 0%, #0f0f1a 100%)',
  },
];

interface GallerySectionProps {
  className?: string;
  isTransition?: boolean;
}

const GallerySection = ({ className = '', isTransition = false }: GallerySectionProps) => {
  return (
    <section id="gallery" className={`py-24 ${className}`}>
      <div className="px-6 max-w-6xl mx-auto">
        <SectionHeader number="03.5" title="Gallery" />
        <ScrollReveal direction="up" delay={0.2}>
          <p className="text-muted-foreground mb-10">
            A visual archive — hover to explore.
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal direction="up" delay={0.4}>
        <div style={{ position: 'relative', minHeight: '600px' }}>
          <ChromaGrid
            items={galleryItems}
            radius={320}
            damping={0.45}
            fadeOut={0.6}
            ease="power3.out"
            columns={3}
            className={isTransition ? '[&_.chroma-overlay]:!backdrop-filter-none [&_.chroma-fade]:!backdrop-filter-none [&_.chroma-card]:!transition-none' : ''}
          />
        </div>
      </ScrollReveal>
    </section>
  );
};

export default GallerySection;
