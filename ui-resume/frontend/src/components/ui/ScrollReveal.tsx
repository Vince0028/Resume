import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
    duration?: number;
    stagger?: number;
    yOffset?: number;
    xOffset?: number;
    isStaggeredChildren?: boolean;
}

const ScrollReveal = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    duration = 0.8,
    stagger = 0.1,
    yOffset = 40,
    xOffset = 40,
    isStaggeredChildren = false,
}: ScrollRevealProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isInsideTransition = !!containerRef.current.closest('[data-transition-overlay]');
            if (prefersReducedMotion || isInsideTransition) {
                gsap.set(containerRef.current, { autoAlpha: 1 });
                if (isStaggeredChildren) {
                    gsap.set(containerRef.current.children, { autoAlpha: 1 });
                }
                return;
            }

            let x = 0;
            let y = 0;

            switch (direction) {
                case 'up':
                    y = yOffset;
                    break;
                case 'down':
                    y = -yOffset;
                    break;
                case 'left':
                    x = xOffset;
                    break;
                case 'right':
                    x = -xOffset;
                    break;
                case 'none':
                    break;
            }

            if (isStaggeredChildren) {
                gsap.set(containerRef.current, { autoAlpha: 1 });
                gsap.fromTo(
                    containerRef.current.children,
                    { autoAlpha: 0, x, y },
                    {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        duration,
                        delay,
                        stagger,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            } else {
                gsap.fromTo(
                    containerRef.current,
                    { autoAlpha: 0, x, y },
                    {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        duration,
                        delay,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }
        },
        { scope: containerRef, dependencies: [direction, delay, duration, stagger, yOffset, xOffset, isStaggeredChildren] }
    );

    return (
        <div ref={containerRef} className={`opacity-0 invisible ${className}`}>
            {children}
        </div>
    );
};

export default ScrollReveal;
