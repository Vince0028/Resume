import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';
import {
  ExternalLink,
  Github,
  Sparkles,
  Cpu,
  Smartphone,
  Layers,
  ArrowUpRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface Project {
  title: string;
  category: 'AI & CV' | 'Full Stack' | 'Mobile & Games' | 'Hardware & IoT';
  description: string;
  tags: string[];
  liveUrl?: string | null;
  repoUrl?: string | null;
  imageUrl?: string | null;
  badge?: string;
}

const projectsData: Project[] = [
  {
    title: 'DengueTect (DSTF)',
    category: 'AI & CV',
    description: 'AI-powered clinical risk calculator and mosquito bite image detection platform with real-time severity scoring.',
    tags: ['React', 'Next.js', 'Python', 'Flask', 'Supabase', 'TypeScript', 'Tailwind'],
    liveUrl: 'https://dengue-tect.vercel.app',
    repoUrl: 'https://github.com/Vince0028',
    imageUrl: `${import.meta.env.BASE_URL}images/denguetech.png`,
    badge: 'Award Winner • Deployed',
  },
  {
    title: 'Veriface',
    category: 'AI & CV',
    description: 'Automated attendance tracking and biometric verification system powered by OpenCV and facial embedding pipelines.',
    tags: ['Python', 'OpenCV', 'NumPy', 'Facial Recognition', 'Computer Vision'],
    repoUrl: 'https://github.com/Vince0028',
    imageUrl: `${import.meta.env.BASE_URL}images/VeriFace.png`,
    badge: 'Computer Vision',
  },
  {
    title: 'AnaLytics',
    category: 'Full Stack',
    description: 'Enterprise inventory management, supply waste minimization tracker, and online storefront platform for rice retailers.',
    tags: ['Python', 'Flask', 'Supabase', 'PostgreSQL', 'JavaScript', 'Tailwind'],
    liveUrl: 'https://analytics-page-1.vercel.app',
    repoUrl: 'https://github.com/Vince0028',
    imageUrl: `${import.meta.env.BASE_URL}images/AnaLytics.png`,
    badge: 'Production • Deployed',
  },
  {
    title: 'NoFluff.ai',
    category: 'Full Stack',
    description: 'AI-curated technical news aggregator and video intelligence hub engineered to eliminate infinite-scroll fatigue.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind', 'NestJS', 'Supabase'],
    liveUrl: 'https://no-fluff-ai.vercel.app/',
    repoUrl: 'https://github.com/Vince0028',
    badge: 'AI Web Platform',
  },
  {
    title: 'GitChat',
    category: 'Mobile & Games',
    description: 'Fully decentralized mesh network chat and video calling application operating over BLE, Wi-Fi Direct, and WebRTC.',
    tags: ['Flutter', 'Dart', 'Kotlin', 'WebRTC', 'Bluetooth LE', 'Arduino'],
    repoUrl: 'https://github.com/Vince0028',
    badge: 'Offline Mesh • P2P',
  },
  {
    title: 'Driver Expression Detector',
    category: 'Hardware & IoT',
    description: 'Edge computer vision safety system running on Raspberry Pi to detect driver drowsiness and trigger instant acoustic alarms.',
    tags: ['Python', 'Raspberry Pi', 'OpenCV', 'Hardware IoT', 'Buzzer Circuit'],
    imageUrl: `${import.meta.env.BASE_URL}images/Driver.png`,
    repoUrl: 'https://github.com/Vince0028',
    badge: 'Edge AI • IoT',
  },
  {
    title: 'TrackMyGains',
    category: 'Full Stack',
    description: 'Intelligent gym progression companion featuring structured training splits and Gemini AI-powered meal analysis.',
    tags: ['React', 'Vite', 'Gemini AI', 'Supabase', 'Tailwind CSS'],
    liveUrl: 'https://track-my-gains-psi.vercel.app',
    repoUrl: 'https://github.com/Vince0028',
    badge: 'Gemini AI Integration',
  },
  {
    title: 'Student Portal',
    category: 'Full Stack',
    description: 'Academic administration platform uniting homework submissions, student engagement tracking, and administrative audit forms.',
    tags: ['Python', 'Flask', 'Supabase', 'PostgreSQL', 'Bootstrap', 'JavaScript'],
    liveUrl: 'https://student-monitor-student-portal.onrender.com',
    imageUrl: `${import.meta.env.BASE_URL}images/Student.png`,
    badge: 'Academic Portal',
  },
  {
    title: 'Project Incognito',
    category: 'Mobile & Games',
    description: 'Cyberpunk-inspired multiplayer social deduction game where secret agents communicate and unmask rogue infiltrators in real-time.',
    tags: ['Flutter', 'Dart', 'Supabase', 'WebSockets', 'Game Dev'],
    repoUrl: 'https://github.com/Vince0028/Impostor-game',
    badge: 'Multiplayer Game',
  },
  {
    title: 'Resume Ranking',
    category: 'Mobile & Games',
    description: 'Profile management and automated candidate evaluation system with a signature Matcha aesthetic and scoring algorithm.',
    tags: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'UI/UX'],
    repoUrl: 'https://github.com/Vince0028/Resume_Ranking',
    badge: 'Mobile App',
  },
  {
    title: 'SmartShut',
    category: 'Hardware & IoT',
    description: 'Microcontroller automated motion-responsive lighting system integrated with ultrasonic proximity sensors and acoustic buzzer.',
    tags: ['Arduino', 'C++', 'Microcontrollers', 'Embedded Sensors'],
    imageUrl: `${import.meta.env.BASE_URL}images/Smartshut.png`,
    badge: 'Embedded System',
  },
  {
    title: 'Hand Gesture Recognition',
    category: 'AI & CV',
    description: 'Real-time webcam hand pose estimation and dynamic gesture classification model for zero-touch interaction.',
    tags: ['Python', 'OpenCV', 'MediaPipe', 'NumPy'],
    repoUrl: 'https://github.com/Vince0028',
    badge: 'Computer Vision',
  },
  {
    title: 'benPDF',
    category: 'Full Stack',
    description: 'All-in-one document suite supporting PDF-to-Word conversions, custom QR code generation, and binary format encoding.',
    tags: ['Python', 'Docker', 'TypeScript', 'JavaScript', 'Render'],
    liveUrl: 'https://benpdf.onrender.com',
    imageUrl: `${import.meta.env.BASE_URL}images/PDFConverter.png`,
    badge: 'Doc Tools & Docker',
  },
  {
    title: 'BETA Budget',
    category: 'Full Stack',
    description: 'Modern financial control system with intelligent receipt OCR text extraction, recurring expenditure tracking, and visual budgets.',
    tags: ['React', 'TypeScript', 'Tailwind', 'Supabase', 'OCR AI'],
    liveUrl: 'https://beta-budget.vercel.app',
    badge: 'FinTech App',
  },
  {
    title: 'Hotel Reservation System',
    category: 'Full Stack',
    description: 'End-to-end hospitality booking engine featuring separate guest room selection portal and administrative analytics backoffice.',
    tags: ['React', 'Vite', 'Tailwind', 'Supabase', 'CRUD'],
    liveUrl: 'https://hotelreservation-phi.vercel.app',
    badge: 'Full Stack App',
  },
  {
    title: 'Synapse',
    category: 'Full Stack',
    description: 'Digital catalog and resource workspace for developers to discover, bookmark, test, and benchmark generative AI agents.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Supabase'],
    liveUrl: 'https://synapse-ben.vercel.app/',
    badge: 'Developer Toolkit',
  },
];

const categories = ['All', 'AI & CV', 'Full Stack', 'Mobile & Games', 'Hardware & IoT'] as const;

/** Map technology name to skillicons.dev slug for crisp brand icons */
const getTechIconSlug = (tech: string): string => {
  const normalized = tech.trim().toLowerCase();
  const map: Record<string, string> = {
    'react': 'react',
    'next.js': 'nextjs',
    'nextjs': 'nextjs',
    'python': 'python',
    'flask': 'flask',
    'supabase': 'supabase',
    'typescript': 'ts',
    'javascript': 'js',
    'tailwind': 'tailwind',
    'tailwind css': 'tailwind',
    'opencv': 'opencv',
    'numpy': 'numpy',
    'flutter': 'flutter',
    'dart': 'dart',
    'kotlin': 'kotlin',
    'arduino': 'arduino',
    'c++': 'cpp',
    'cpp': 'cpp',
    'raspberry pi': 'raspberrypi',
    'docker': 'docker',
    'postgresql': 'postgres',
    'postgres': 'postgres',
    'bootstrap': 'bootstrap',
    'vite': 'vite',
    'nestjs': 'nestjs',
    'html': 'html',
    'css': 'css',
    'webrtc': 'webrtc',
    'bluetooth le': 'arduino',
    'gemini ai': 'ai',
    'ocr ai': 'ai',
    'game dev': 'unity',
    'computer vision': 'opencv',
    'facial recognition': 'opencv',
    'mediapipe': 'python',
  };
  return map[normalized] || 'vscode';
};

interface ProjectsSectionProps {
  className?: string;
  isDarkMode?: boolean;
}

const ProjectsSection = ({ className = '' }: ProjectsSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset carousel to first slide on category or query change
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [emblaApi, activeCategory, searchQuery]);

  // Auto-play interval (pauses on user hover)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!emblaApi || !isAutoPlaying || isHovered) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [emblaApi, isAutoPlaying, isHovered]);

  return (
    <section id="projects" className={`py-24 px-6 relative overflow-hidden ${className}`}>
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <SectionHeader number="03" title="Featured Projects" />

          {/* Carousel Navigation Top Controls */}
          <div className="flex items-center gap-3 pb-12">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Interactive Carousel</span>
              <span className="text-primary font-bold">
                [{String(selectedIndex + 1).padStart(2, '0')} / {String(filteredProjects.length).padStart(2, '0')}]
              </span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              title={isAutoPlaying ? 'Pause Auto-slide' : 'Resume Auto-slide'}
              className="w-9 h-9 rounded-lg bg-card/70 border border-primary/20 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              {isAutoPlaying ? <Pause size={13} /> : <Play size={13} className="text-primary" />}
            </button>

            {/* Previous Arrow */}
            <button
              onClick={scrollPrev}
              aria-label="Previous Project"
              className="w-10 h-10 rounded-lg bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/15 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 shadow-md hover:scale-105"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Next Arrow */}
            <button
              onClick={scrollNext}
              aria-label="Next Project"
              className="w-10 h-10 rounded-lg bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/15 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 shadow-md hover:scale-105"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <ScrollReveal direction="up" duration={0.6}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold scale-105'
                        : 'bg-card/60 hover:bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat === 'All' && <Layers size={13} />}
                    {cat === 'AI & CV' && <Sparkles size={13} />}
                    {cat === 'Full Stack' && <ArrowUpRight size={13} />}
                    {cat === 'Mobile & Games' && <Smartphone size={13} />}
                    {cat === 'Hardware & IoT' && <Cpu size={13} />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tech, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-card/60 border border-border/60 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* EMBLA CAROUSEL WRAPPER WITH REAL SIDE ARROWS */}
        <div
          className="relative group/carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Floating Left Carousel Arrow */}
          <button
            onClick={scrollPrev}
            aria-label="Previous Projects"
            className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card/95 border border-primary/50 text-foreground hover:text-primary hover:bg-card shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:border-primary hover:shadow-[0_0_20px_rgba(212,132,26,0.4)]"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          {/* Floating Right Carousel Arrow */}
          <button
            onClick={scrollNext}
            aria-label="Next Projects"
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card/95 border border-primary/50 text-foreground hover:text-primary hover:bg-card shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:border-primary hover:shadow-[0_0_20px_rgba(212,132,26,0.4)]"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>

          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing -mx-3 px-3 py-4"
            ref={emblaRef}
          >
            <div className="flex -ml-4">
              {filteredProjects.map((project, idx) => (
                <div
                  key={project.title}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4"
                >
                  <div className="group relative flex flex-col justify-between h-full rounded-2xl border border-primary/20 bg-card/45 backdrop-blur-md hover:border-primary/60 hover:bg-card/75 transition-all duration-500 shadow-xl overflow-hidden hover:-translate-y-1">
                    {/* Top neon glow bar */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div>
                      {/* Project Image Banner */}
                      {project.imageUrl ? (
                        <div className="relative w-full h-44 overflow-hidden bg-background/50 border-b border-primary/10">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700 select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                        </div>
                      ) : (
                        <div className="relative w-full h-24 overflow-hidden bg-background/30 border-b border-primary/10 flex items-center justify-between px-6">
                          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                            // {project.category}
                          </span>
                          <span className="font-mono text-xs text-primary/70">
                            #0{idx + 1}
                          </span>
                        </div>
                      )}

                      {/* Header info */}
                      <div className="p-6 pb-3">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider font-semibold">
                            {project.badge || project.category}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground uppercase">
                            {project.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {project.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Tech Stack with Icons and Project Actions */}
                    <div className="p-6 pt-2">
                      {/* Tech stack pills with colored official brand icons */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.tags.map((tag) => {
                          const slug = getTechIconSlug(tag);
                          return (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/70 hover:bg-secondary text-foreground/90 border border-border/50 text-[11px] font-mono transition-colors shadow-sm"
                            >
                              <img
                                src={`https://skillicons.dev/icons?i=${slug}&theme=dark`}
                                alt={tag}
                                className="w-3.5 h-3.5 rounded-sm object-contain shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                              <span>{tag}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Links and Index */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                              aria-label={`View ${project.title} code`}
                            >
                              <Github size={14} />
                              <span>Code</span>
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary hover:underline transition-colors"
                              aria-label={`Open ${project.title} live demo`}
                            >
                              <ExternalLink size={14} />
                              <span>Live Demo</span>
                            </a>
                          )}
                        </div>

                        <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
                          #VNA-{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Bottom Indicator Dots & Drag Tip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              Swipe or use arrows to navigate
            </span>
          </div>

          {/* Interactive Slide Dots */}
          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto py-1">
            {scrollSnaps.map((_, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-7 bg-primary shadow-[0_0_10px_rgba(212,132,26,0.5)]'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                />
              );
            })}
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            Total {filteredProjects.length} Projects
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
