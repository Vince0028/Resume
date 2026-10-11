import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Robot from '../components/resume/Robot';

interface RobotContextType {
    targetRef: React.RefObject<HTMLDivElement> | null;
    setTargetRef: (ref: React.RefObject<HTMLDivElement>) => void;
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export function RobotProvider({ children }: { children: ReactNode }) {
    const [targetRef, setTargetRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    return (
        <RobotContext.Provider value={{ targetRef, setTargetRef, isVisible, setIsVisible }}>
            {children}
            <RobotOverlay />
        </RobotContext.Provider>
    );
}

export function useRobotTarget(ref: React.RefObject<HTMLDivElement>) {
    const context = useContext(RobotContext);
    if (!context) throw new Error('useRobotTarget must be used within RobotProvider');

    useEffect(() => {
        context.setTargetRef(ref);
        context.setIsVisible(true);
        return () => {
            context.setIsVisible(false);
            // Don't unset target ref immediately to avoid flicker if it's just a remount? 
            // Actually, if unmounting, we should probably hide.
        };
    }, [ref, context]);

    return context;
}

function RobotOverlay() {
    const context = useContext(RobotContext);
    const overlayRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();

    useEffect(() => {
        const updatePosition = () => {
            const el = overlayRef.current;
            if (!el) {
                requestRef.current = requestAnimationFrame(updatePosition);
                return;
            }

            if (context?.targetRef?.current && context.isVisible) {
                const rect = context.targetRef.current.getBoundingClientRect();

                if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
                    el.style.display = 'none';
                } else {
                    el.style.display = 'block';
                    el.style.position = 'fixed';
                    el.style.top = rect.top + 'px';
                    el.style.left = rect.left + 'px';
                    el.style.width = rect.width + 'px';
                    el.style.height = rect.height + 'px';
                    el.style.zIndex = '55';
                    el.style.overflow = 'hidden';
                    el.style.borderRadius = '12px';
                    el.style.pointerEvents = 'none';
                }
            } else {
                el.style.display = 'none';
            }
            requestRef.current = requestAnimationFrame(updatePosition);
        };

        requestRef.current = requestAnimationFrame(updatePosition);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [context?.targetRef, context?.isVisible]);

    if (!context) return null;

    return createPortal(
        <div ref={overlayRef} style={{ display: 'none' }}>
            <div className="w-full h-full pointer-events-auto">
                <Robot />
            </div>
        </div>,
        document.body
    );
}
