import React, { useState, useEffect } from 'react';

type FlickerProps = {
    children: React.ReactNode;
    className?: string;
    
    errorChance?: number;
    
    errorLabel?: string;
    
    replaceWithError?: boolean;
};

const Flicker: React.FC<FlickerProps> = ({
    children,
    className = '',
    errorChance = 0, 
    errorLabel = 'error',
    replaceWithError = false
}) => {
    const [opacity, setOpacity] = useState(1);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let timeout: any;
        let mounted = true;

        const runFlickerSequence = () => {
            if (!mounted) return;

            
            const flickerCount = Math.floor(Math.random() * 4) + 1;
            let toggles = 0;
            const totalToggles = flickerCount * 2;

            
            const willError = Math.random() < errorChance;

            const toggle = () => {
                if (!mounted) return;

                if (toggles >= totalToggles) {
                    setOpacity(1);
                    
                    if (willError && isError) {
                        
                        timeout = setTimeout(() => { if (mounted) setIsError(false); }, Math.random() * 1000 + 300);
                    }
                    scheduleNext();
                    return;
                }

                // Keep a minimum opacity so the panel never fully disappears on desktop
                const minOpacity = 0.5;
                const flickerOpacity = Math.max(minOpacity, Math.random() * 0.4 + 0.5);
                const newOpacity = toggles % 2 === 0 ? flickerOpacity : 1;
                setOpacity(newOpacity);
                toggles++;

                
                const duration = Math.random() * 100 + 20;
                
                if (willError && toggles === 1) {
                    setIsError(true);
                }

                timeout = setTimeout(toggle, duration);
            };

            toggle();
        };

        const scheduleNext = () => {
            if (!mounted) return;
            
            const delay = Math.random() * 2200 + 300;
            timeout = setTimeout(runFlickerSequence, delay);
        };

        
        timeout = setTimeout(scheduleNext, Math.random() * 800);

        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [errorChance]);

    
    const renderContent = () => {
        if (isError && replaceWithError) {
            return <span style={{ color: 'var(--red, #f87171)' }}>{errorLabel}</span>;
        }

        
        if (isError) {
            return <span style={{ color: 'var(--red, #f87171)' }}>{children}</span>;
        }

        return children;
    };

    return (
        <span 
            className={className} 
            style={{ 
                opacity, 
                transition: 'opacity 30ms linear',
                display: 'inline',
                whiteSpace: 'nowrap'
            }}
        >
            {renderContent()}
        </span>
    );
};

export default Flicker;
