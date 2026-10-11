import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';
import {
  Award,
  ExternalLink,
  ShieldCheck,
  Brain,
  Code2,
  Briefcase,
  BarChart3,
  Search,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface Certificate {
  name: string;
  category: 'AI & ML' | 'Cloud & IT' | 'Programming' | 'Business' | 'Data & Design';
  issuer: string;
  file: string;
  previewImage: string;
  type: 'pdf' | 'img';
  isEssential?: boolean;
}

const certificatesData: Certificate[] = [
  // ── Highlighted Credentials ──
  {
    name: 'NC2 Animation National Certificate (TESDA)',
    category: 'Data & Design',
    issuer: 'TESDA National Qualification',
    file: 'Design/NC2_Animation_TESDA_Certificate.png',
    previewImage: 'NC2_Animation_TESDA_Certificate.png',
    type: 'img',
    isEssential: true,
  },
  {
    name: 'Salesforce AgentBlazer Workshop Completion Certificate',
    category: 'Cloud & IT',
    issuer: 'Salesforce',
    file: 'Cloud, IT & Cybersecurity/AgentBlazer_Certificate.pdf',
    previewImage: 'AgentBlazer_Certificate.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'AWS Cloud Club Core Team Recognition',
    category: 'Cloud & IT',
    issuer: 'AWS Cloud Clubs',
    file: 'Cloud, IT & Cybersecurity/aws-cloud-club-core-team.png',
    previewImage: 'aws-cloud-club-core-team.png',
    type: 'img',
    isEssential: true,
  },
  {
    name: 'Salesforce Trailhead Accomplishment',
    category: 'Cloud & IT',
    issuer: 'Salesforce',
    file: 'Cloud, IT & Cybersecurity/Salesforce_Trailhead_Certificate.png',
    previewImage: 'Salesforce_Trailhead_Certificate.png',
    type: 'img',
    isEssential: true,
  },

  // ── Newly Added Professional Credentials ──
  {
    name: 'Generative AI for Customer Service with Microsoft 365 Copilot',
    category: 'AI & ML',
    issuer: 'Microsoft & LinkedIn',
    file: 'CertificateOfCompletion_Generative AI for Customer Service with Microsoft 365 Copilot Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_Generative AI for Customer Service with Microsoft 365 Copilot Professional Certificate.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'Docker Foundations Professional Certificate',
    category: 'Programming',
    issuer: 'Docker & LinkedIn',
    file: 'CertificateOfCompletion_Docker Foundations Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_Docker Foundations Professional Certificate.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'Atlassian Agile Project Management Professional Certificate',
    category: 'Business',
    issuer: 'Atlassian',
    file: 'CertificateOfCompletion_Atlassian Agile Project Management Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_Atlassian Agile Project Management Professional Certificate.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'Microsoft Security Essentials Professional Certificate',
    category: 'Cloud & IT',
    issuer: 'Microsoft & LinkedIn',
    file: 'CertificateOfCompletion_Microsoft Security Essentials Professional Certificate by Microsoft and LinkedIn.pdf',
    previewImage: 'CertificateOfCompletion_Microsoft Security Essentials Professional Certificate by Microsoft and LinkedIn.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'CSCMP Supply Chain Foundations: Operations Certificate',
    category: 'Business',
    issuer: 'CSCMP',
    file: 'CertificateOfCompletion_CSCMP Supply Chain Foundations Manufacturing and Service Operations Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_CSCMP Supply Chain Foundations Manufacturing and Service Operations Professional Certificate.png',
    type: 'pdf',
  },
  {
    name: 'Responsible AI Foundations Professional Certificate',
    category: 'AI & ML',
    issuer: 'All Tech Is Human',
    file: 'CertificateOfCompletion_Responsible AI Foundations Professional Certificate by All Tech Is Human.pdf',
    previewImage: 'CertificateOfCompletion_Responsible AI Foundations Professional Certificate by All Tech Is Human.png',
    type: 'pdf',
  },
  {
    name: 'Hardware and Upgrade Support Specialist',
    category: 'Cloud & IT',
    issuer: 'IT Technical Support Qualification',
    file: 'HardwareandUpgradeSupportv120260813-20-gx6ul7.pdf',
    previewImage: 'HardwareandUpgradeSupportv120260813-20-gx6ul7.png',
    type: 'pdf',
  },
  {
    name: 'IT Customer Support Basics',
    category: 'Cloud & IT',
    issuer: 'Technical Operations Support',
    file: 'ITCustomerSupportBasicsv120260813-20-ebg9g3.pdf',
    previewImage: 'ITCustomerSupportBasicsv120260813-20-ebg9g3.png',
    type: 'pdf',
  },
  {
    name: 'Operating Systems Support Specialist',
    category: 'Cloud & IT',
    issuer: 'Systems Administration Qualification',
    file: 'OperatingSystemsSupportv120260813-20-9y11dg.pdf',
    previewImage: 'OperatingSystemsSupportv120260813-20-9y11dg.png',
    type: 'pdf',
  },
  {
    name: 'Security and Connectivity Support Specialist',
    category: 'Cloud & IT',
    issuer: 'Network Infrastructure Support',
    file: 'SecurityandConnectivitySupportv120260813-20-i2o8f0.pdf',
    previewImage: 'SecurityandConnectivitySupportv120260813-20-i2o8f0.png',
    type: 'pdf',
  },

  // ── AI & Machine Learning ──
  {
    name: 'Career Essentials in Generative AI',
    category: 'AI & ML',
    issuer: 'Microsoft & LinkedIn',
    file: 'AI & Machine Learning/CertificateOfCompletion_Career Essentials in Generative AI by Microsoft and LinkedIn.pdf',
    previewImage: 'CertificateOfCompletion_Career Essentials in Generative AI by Microsoft and LinkedIn.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'Microsoft Azure AI Essentials Professional Certificate',
    category: 'AI & ML',
    issuer: 'Microsoft & LinkedIn',
    file: 'AI & Machine Learning/CertificateOfCompletion_Microsoft Azure AI Essentials Professional Certificate by Microsoft and LinkedIn.pdf',
    previewImage: 'CertificateOfCompletion_Microsoft Azure AI Essentials Professional Certificate by Microsoft and LinkedIn.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'AI for Organizational Leaders',
    category: 'AI & ML',
    issuer: 'Microsoft & LinkedIn',
    file: 'AI & Machine Learning/CertificateOfCompletion_AI for Organizational Leaders by Microsoft and LinkedIn.pdf',
    previewImage: 'CertificateOfCompletion_AI for Organizational Leaders by Microsoft and LinkedIn.png',
    type: 'pdf',
  },
  {
    name: 'Deep Learning Image Recognition',
    category: 'AI & ML',
    issuer: 'LinkedIn Learning',
    file: 'AI & Machine Learning/CertificateOfCompletion_Deep Learning Image Recognition.pdf',
    previewImage: 'CertificateOfCompletion_Deep Learning Image Recognition.png',
    type: 'pdf',
  },
  {
    name: 'Machine Learning Statistical Foundations',
    category: 'AI & ML',
    issuer: 'Wolfram Research',
    file: 'AI & Machine Learning/CertificateOfCompletion_Machine Learning Statistical Foundations Professional Certificate by Wolfram Research.pdf',
    previewImage: 'CertificateOfCompletion_Machine Learning Statistical Foundations Professional Certificate by Wolfram Research.png',
    type: 'pdf',
  },
  {
    name: 'Using AI for UX Design and Research',
    category: 'AI & ML',
    issuer: 'LinkedIn Learning',
    file: 'AI & Machine Learning/CertificateOfCompletion_Using AI for UX Design and Research.pdf',
    previewImage: 'CertificateOfCompletion_Using AI for UX Design and Research.png',
    type: 'pdf',
  },
  {
    name: 'IBM Explore Emerging Tech',
    category: 'AI & ML',
    issuer: 'IBM',
    file: 'AI & Machine Learning/IBM_Explore_Emerging_Tech_Certificate.png',
    previewImage: 'IBM_Explore_Emerging_Tech_Certificate.png',
    type: 'img',
  },

  // ── Cloud, IT & Cybersecurity ──
  {
    name: 'Career Essentials in GitHub Professional Certificate',
    category: 'Cloud & IT',
    issuer: 'GitHub',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_Career Essentials in GitHub Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_Career Essentials in GitHub Professional Certificate.png',
    type: 'pdf',
  },
  {
    name: 'Atlassian IT Service Management (ITSM)',
    category: 'Cloud & IT',
    issuer: 'Atlassian',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_Atlassian IT Service Management ITSM Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_Atlassian IT Service Management ITSM Professional Certificate.png',
    type: 'pdf',
  },
  {
    name: 'Certified Information Security Manager (CISM) Prep',
    category: 'Cloud & IT',
    issuer: 'LinkedIn Learning',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_Certified Information Security Manager CISM Cert Prep 2022 3 Information Security Program.pdf',
    previewImage: 'CertificateOfCompletion_Certified Information Security Manager CISM Cert Prep 2022 3 Information Security Program.png',
    type: 'pdf',
  },
  {
    name: 'Ubuntu Linux Professional Certificate',
    category: 'Cloud & IT',
    issuer: 'Canonical',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_Ubuntu Linux Professional Certificate by Canonical.pdf',
    previewImage: 'CertificateOfCompletion_Ubuntu Linux Professional Certificate by Canonical.png',
    type: 'pdf',
  },
  {
    name: 'ServiceNow IT Leadership Professional Certificate',
    category: 'Cloud & IT',
    issuer: 'ServiceNow',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_ServiceNow IT Leadership Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_ServiceNow IT Leadership Professional Certificate.png',
    type: 'pdf',
  },
  {
    name: 'CompTIA Network+ Practice Qualification 1',
    category: 'Cloud & IT',
    issuer: 'CompTIA',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_Practice Exam 1 for CompTIA Network N10009.pdf',
    previewImage: 'CertificateOfCompletion_Practice Exam 1 for CompTIA Network N10009.png',
    type: 'pdf',
  },
  {
    name: 'CompTIA Network+ Practice Qualification 2',
    category: 'Cloud & IT',
    issuer: 'CompTIA',
    file: 'Cloud, IT & Cybersecurity/CertificateOfCompletion_Practice Exam 2 for CompTIA Network N10009.pdf',
    previewImage: 'CertificateOfCompletion_Practice Exam 2 for CompTIA Network N10009.png',
    type: 'pdf',
  },

  // ── Programming & Development ──
  {
    name: 'Become a Full-Stack Web Developer',
    category: 'Programming',
    issuer: 'LinkedIn Learning',
    file: 'Programming & Development/CertificateOfCompletion_Become a FullStack Web Developer.pdf',
    previewImage: 'CertificateOfCompletion_Become a FullStack Web Developer.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'Java Foundations Professional Certificate',
    category: 'Programming',
    issuer: 'JetBrains',
    file: 'Programming & Development/CertificateOfCompletion_Java Foundations Professional Certificate by JetBrains.pdf',
    previewImage: 'CertificateOfCompletion_Java Foundations Professional Certificate by JetBrains.png',
    type: 'pdf',
  },
  {
    name: 'JavaScript Foundations Professional Certificate',
    category: 'Programming',
    issuer: 'Mozilla',
    file: 'Programming & Development/CertificateOfCompletion_JavaScript Foundations Professional Certificate by Mozilla.pdf',
    previewImage: 'CertificateOfCompletion_JavaScript Foundations Professional Certificate by Mozilla.png',
    type: 'pdf',
  },
  {
    name: 'Programming Foundations: Data Structures',
    category: 'Programming',
    issuer: 'LinkedIn Learning',
    file: 'Programming & Development/CertificateOfCompletion_Programming Foundations Data Structures 2019.pdf',
    previewImage: 'CertificateOfCompletion_Programming Foundations Data Structures 2019.png',
    type: 'pdf',
  },
  {
    name: 'Programming Foundations: Test-Driven Development (TDD)',
    category: 'Programming',
    issuer: 'LinkedIn Learning',
    file: 'Programming & Development/CertificateOfCompletion_Programming Foundations TestDriven Development.pdf',
    previewImage: 'CertificateOfCompletion_Programming Foundations TestDriven Development.png',
    type: 'pdf',
  },
  {
    name: 'Python Data Structures: Stacks, Trees & Linked Lists',
    category: 'Programming',
    issuer: 'LinkedIn Learning',
    file: 'Programming & Development/CertificateOfCompletion_Python Data Structures  Trees.pdf',
    previewImage: 'CertificateOfCompletion_Python Data Structures  Trees.png',
    type: 'pdf',
  },
  {
    name: 'Python Essential Training',
    category: 'Programming',
    issuer: 'LinkedIn Learning',
    file: 'Programming & Development/CertificateOfCompletion_Python Essential Training.pdf',
    previewImage: 'CertificateOfCompletion_Python Essential Training.png',
    type: 'pdf',
  },
  {
    name: 'Software Design: Developing Effective Requirements',
    category: 'Programming',
    issuer: 'LinkedIn Learning',
    file: 'Programming & Development/CertificateOfCompletion_Software Design Developing Effective Requirements.pdf',
    previewImage: 'CertificateOfCompletion_Software Design Developing Effective Requirements.png',
    type: 'pdf',
  },

  // ── Business & Management ──
  {
    name: 'Introduction to SAP S/4HANA',
    category: 'Business',
    issuer: 'SAP',
    file: 'Business & Management/BUSPROS1-Introduction to S4HANA.pdf',
    previewImage: 'BUSPROS1-Introduction to S4HANA.png',
    type: 'pdf',
    isEssential: true,
  },
  {
    name: 'Career Essentials in Project Management',
    category: 'Business',
    issuer: 'Microsoft & LinkedIn',
    file: 'Business & Management/CertificateOfCompletion_Career Essentials in Project Management by Microsoft and LinkedIn.pdf',
    previewImage: 'CertificateOfCompletion_Career Essentials in Project Management by Microsoft and LinkedIn.png',
    type: 'pdf',
  },
  {
    name: 'Agile Project Management with MS Project',
    category: 'Business',
    issuer: 'Microsoft',
    file: 'Business & Management/CertificateOfCompletion_Agile Project Management with Microsoft Project 2021.pdf',
    previewImage: 'CertificateOfCompletion_Agile Project Management with Microsoft Project 2021.png',
    type: 'pdf',
  },
  {
    name: 'Learning SAP Production Planning',
    category: 'Business',
    issuer: 'SAP',
    file: 'Business & Management/CertificateOfCompletion_Learning SAP Production Planning.pdf',
    previewImage: 'CertificateOfCompletion_Learning SAP Production Planning.png',
    type: 'pdf',
  },
  {
    name: 'Negotiation Professional Certificate',
    category: 'Business',
    issuer: 'American Negotiation Institute',
    file: 'Business & Management/CertificateOfCompletion_Negotiation Professional Certificate by American Negotiation Institute.pdf',
    previewImage: 'CertificateOfCompletion_Negotiation Professional Certificate by American Negotiation Institute.png',
    type: 'pdf',
  },
  {
    name: 'Public Speaking Skills Professional Certificate',
    category: 'Business',
    issuer: 'Toastmasters International',
    file: 'Business & Management/CertificateOfCompletion_Public Speaking Skills Professional Certificate by Toastmasters International.pdf',
    previewImage: 'CertificateOfCompletion_Public Speaking Skills Professional Certificate by Toastmasters International.png',
    type: 'pdf',
  },

  // ── Data & Design ──
  {
    name: 'Complete Guide to Excel Statistics with Copilot',
    category: 'Data & Design',
    issuer: 'Microsoft',
    file: 'Data & Analytics/CertificateOfCompletion_Complete Guide to Excel Statistics with Copilot.pdf',
    previewImage: 'CertificateOfCompletion_Complete Guide to Excel Statistics with Copilot.png',
    type: 'pdf',
  },
  {
    name: 'Excel and ChatGPT Data Analysis Power Tips',
    category: 'Data & Design',
    issuer: 'LinkedIn Learning',
    file: 'Data & Analytics/CertificateOfCompletion_Excel and ChatGPT Data Analysis Power Tips.pdf',
    previewImage: 'CertificateOfCompletion_Excel and ChatGPT Data Analysis Power Tips.png',
    type: 'pdf',
  },
  {
    name: 'Adobe InDesign Professional Certificate',
    category: 'Data & Design',
    issuer: 'Adobe',
    file: 'Design/CertificateOfCompletion_Essential Skills in Adobe InDesign 2024 Professional Certificate.pdf',
    previewImage: 'CertificateOfCompletion_Essential Skills in Adobe InDesign 2024 Professional Certificate.png',
    type: 'pdf',
  },
];

const categories = ['All', 'Essential', 'AI & ML', 'Cloud & IT', 'Programming', 'Business', 'Data & Design'] as const;

interface CertificatesSectionProps {
  className?: string;
  isDarkMode?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'AI & ML':
      return <Brain size={14} className="text-purple-400" />;
    case 'Cloud & IT':
      return <ShieldCheck size={14} className="text-blue-400" />;
    case 'Programming':
      return <Code2 size={14} className="text-emerald-400" />;
    case 'Business':
      return <Briefcase size={14} className="text-amber-400" />;
    case 'Data & Design':
      return <BarChart3 size={14} className="text-pink-400" />;
    default:
      return <Award size={14} className="text-primary" />;
  }
};

const CertificatesSection = ({ className = '' }: CertificatesSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const filteredCerts = useMemo(() => {
    return certificatesData.filter((c) => {
      const matchesCategory =
        activeCategory === 'All'
          ? true
          : activeCategory === 'Essential'
          ? c.isEssential
          : c.category === activeCategory;
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Reset carousel to first slide on filter change
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [emblaApi, activeCategory, searchQuery]);

  // Auto-play timer (pauses on hover)
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

  const getCertUrl = (cert: Certificate) => {
    return encodeURI(`${import.meta.env.BASE_URL}certificates/${cert.file}`);
  };

  const getCertPreviewUrl = (cert: Certificate) => {
    return encodeURI(`${import.meta.env.BASE_URL}certificates_preview/${cert.previewImage}`);
  };

  return (
    <section id="certificates" className={`py-24 px-6 relative overflow-hidden ${className}`}>
      {/* Background glow effects */}
      <div className="absolute top-1/3 -left-36 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-36 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <SectionHeader number="05" title="Certifications" />

          {/* Carousel Top Controls */}
          <div className="flex items-center gap-3 pb-12">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mr-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="hidden sm:inline">Credentials Carousel</span>
              <span className="text-primary font-bold">
                [{String(selectedIndex + 1).padStart(2, '0')} / {String(filteredCerts.length).padStart(2, '0')}]
              </span>
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              title={isAutoPlaying ? 'Pause Auto-slide' : 'Resume Auto-slide'}
              className="w-9 h-9 rounded-lg bg-card/70 border border-primary/20 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              {isAutoPlaying ? <Pause size={13} /> : <Play size={13} className="text-primary" />}
            </button>

            {/* Previous */}
            <button
              onClick={scrollPrev}
              aria-label="Previous Certificate"
              className="w-10 h-10 rounded-lg bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/15 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 shadow-md hover:scale-105"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Next */}
            <button
              onClick={scrollNext}
              aria-label="Next Certificate"
              className="w-10 h-10 rounded-lg bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/15 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 shadow-md hover:scale-105"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Highlight Stats Strip */}
        <ScrollReveal direction="up" duration={0.6}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm text-center">
              <div className="font-mono text-2xl font-bold text-primary">45+</div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase mt-1">Verified Credentials</div>
            </div>
            <div className="p-4 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm text-center">
              <div className="font-mono text-2xl font-bold text-foreground">Microsoft & AWS</div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase mt-1">Cloud, AI & Tech</div>
            </div>
            <div className="p-4 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm text-center">
              <div className="font-mono text-2xl font-bold text-foreground">TESDA NC2</div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase mt-1">National Qualification</div>
            </div>
            <div className="p-4 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm text-center">
              <div className="font-mono text-2xl font-bold text-foreground">Salesforce</div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase mt-1">AgentBlazer Certified</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Filter and Search Bar */}
        <ScrollReveal direction="up" duration={0.6} delay={0.1}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold scale-105'
                        : 'bg-card/60 hover:bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat === 'Essential' ? <Sparkles size={13} className="text-amber-400" /> : getCategoryIcon(cat)}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search certificate..."
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
            aria-label="Previous Certificate"
            className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card/95 border border-primary/50 text-foreground hover:text-primary hover:bg-card shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:border-primary hover:shadow-[0_0_20px_rgba(212,132,26,0.4)]"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          {/* Floating Right Carousel Arrow */}
          <button
            onClick={scrollNext}
            aria-label="Next Certificate"
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card/95 border border-primary/50 text-foreground hover:text-primary hover:bg-card shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:border-primary hover:shadow-[0_0_20px_rgba(212,132,26,0.4)]"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>

          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing -mx-3 px-3 py-4"
            ref={emblaRef}
          >
            <div className="flex -ml-4">
              {filteredCerts.map((cert, idx) => (
                <div
                  key={cert.name + idx}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 pl-4"
                >
                  <div
                    onClick={() => setSelectedCert(cert)}
                    className="group relative cursor-pointer flex flex-col justify-between h-full rounded-2xl border border-primary/20 bg-card/45 backdrop-blur-md hover:border-primary/60 hover:bg-card/75 transition-all duration-500 shadow-xl overflow-hidden hover:-translate-y-1.5"
                  >
                    {/* Top neon glow bar */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div>
                      {/* Scanned PNG Preview Image shown directly on card */}
                      <div className="relative w-full h-44 overflow-hidden bg-background/50 border-b border-primary/10 flex items-center justify-center p-2.5">
                        <img
                          src={getCertPreviewUrl(cert)}
                          alt={cert.name}
                          className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500 shadow-sm"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 pointer-events-none" />

                        {cert.isEssential && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-md">
                            <Sparkles size={10} />
                            <span>FEATURED</span>
                          </div>
                        )}
                      </div>

                      {/* Header and Info */}
                      <div className="p-5 pb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/40 uppercase font-semibold flex items-center gap-1.5">
                            {getCategoryIcon(cert.category)}
                            {cert.category}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground/70 uppercase">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {cert.name}
                        </h3>

                        <p className="font-mono text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                          <Award size={13} className="text-primary shrink-0" />
                          <span className="truncate">{cert.issuer}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 pt-2">
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="font-mono text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                          <FileText size={11} />
                          {cert.type.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs text-primary font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Inspect</span>
                          <ExternalLink size={12} />
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
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>Swipe or click arrows to view certificates</span>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto py-1">
            {scrollSnaps.slice(0, 15).map((_, index) => {
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
            Total {filteredCerts.length} Verified Certificates
          </div>
        </div>
      </div>

      {/* Lightbox / Modal for Previewing Certificate Document */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-[250] bg-background/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-primary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between bg-card/80">
              <div className="flex items-center gap-3 pr-4">
                <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <Award size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">{selectedCert.name}</h3>
                  <p className="font-mono text-xs text-muted-foreground">{selectedCert.issuer} • {selectedCert.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getCertUrl(selectedCert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open Full Document</span>
                </a>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="w-8 h-8 rounded-lg bg-secondary hover:bg-destructive hover:text-destructive-foreground border border-border flex items-center justify-center transition-colors text-muted-foreground"
                  aria-label="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-auto flex-1 flex items-center justify-center bg-background/50 min-h-[350px]">
              <img
                src={getCertPreviewUrl(selectedCert)}
                alt={selectedCert.name}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg border border-border/60"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CertificatesSection;
