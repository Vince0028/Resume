import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

interface ChromaGridItem {
    image: string;
    title: string;
    subtitle?: string;
    handle?: string;
    borderColor?: string;
    gradient?: string;
    url?: string;
    location?: string;
}

interface ChromaGridProps {
    items?: ChromaGridItem[];
    className?: string;
    radius?: number;
    columns?: number;
    rows?: number;
    damping?: number;
    fadeOut?: number;
    ease?: string;
}

export const ChromaGrid = ({
    items,
    className = '',
    radius = 300,
    columns = 3,
    damping = 0.45,
    fadeOut = 0.6,
    ease = 'power3.out',
}: ChromaGridProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const fadeRef = useRef<HTMLDivElement>(null);
    const setX = useRef<((v: number) => void) | null>(null);
    const setY = useRef<((v: number) => void) | null>(null);
    const pos = useRef({ x: 0, y: 0 });

    const data = items?.length ? items : [];

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        setX.current = gsap.quickSetter(el, '--x', 'px') as (v: number) => void;
        setY.current = gsap.quickSetter(el, '--y', 'px') as (v: number) => void;
        const { width, height } = el.getBoundingClientRect();
        pos.current = { x: width / 2, y: height / 2 };
        setX.current(pos.current.x);
        setY.current(pos.current.y);
    }, []);

    const moveTo = (x: number, y: number) => {
        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                setX.current?.(pos.current.x);
                setY.current?.(pos.current.y);
            },
            overwrite: true,
        });
    };

    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const r = rootRef.current!.getBoundingClientRect();
        moveTo(e.clientX - r.left, e.clientY - r.top);
        gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    };

    const handleLeave = () => {
        gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
    };

    const handleCardClick = (url?: string) => {
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleCardMove = (e: React.MouseEvent<HTMLElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <div
            ref={rootRef}
            className={`chroma-grid ${className}`}
            style={
                {
                    '--r': `${radius}px`,
                    '--cols': columns,
                } as React.CSSProperties
            }
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
        >
            {data.map((c, i) => (
                <article
                    key={i}
                    className="chroma-card"
                    onMouseMove={handleCardMove}
                    onClick={() => handleCardClick(c.url)}
                    style={
                        {
                            '--card-border': c.borderColor || 'transparent',
                            '--card-gradient': c.gradient || 'linear-gradient(145deg, #1e293b, #000)',
                            cursor: c.url ? 'pointer' : 'default',
                        } as React.CSSProperties
                    }
                >
                    <div className="chroma-img-wrapper">
                        <img src={c.image} alt={c.title} loading="eager" />
                    </div>
                    <footer className="chroma-info">
                        <h3 className="name">{c.title}</h3>
                        {c.handle && <span className="handle">{c.handle}</span>}
                        {c.subtitle && <p className="role">{c.subtitle}</p>}
                        {c.location && <span className="location">{c.location}</span>}
                    </footer>
                </article>
            ))}
            <div className="chroma-overlay" />
            <div ref={fadeRef} className="chroma-fade" />
        </div>
    );
};

export default ChromaGrid;
