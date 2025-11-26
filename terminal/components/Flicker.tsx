import React, { useState, useEffect } from 'react';

type FlickerProps = {
    children: React.ReactNode;
    className?: string;
    // chance (0-1) that an "error" will occur during a flicker cycle
    errorChance?: number;
    // label to show when error occurs
    errorLabel?: string;
    // whether this flicker should attempt to show error replacement of numeric stats
    replaceWithError?: boolean;
};

const Flicker: React.FC<FlickerProps> = ({
    children,
    className = '',
    errorChance = 0, // disabled by default; enable only when explicitly needed
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

            // More frequent: flicker count 1-4 times
            const flickerCount = Math.floor(Math.random() * 4) + 1;
            let toggles = 0;
            const totalToggles = flickerCount * 2;

            // Decide if this sequence will include an error
            const willError = Math.random() < errorChance;

            const toggle = () => {
                if (!mounted) return;

                if (toggles >= totalToggles) {
                    setOpacity(1);
                    // If we set an error state, clear it after a brief moment
                    if (willError && isError) {
                        // leave error for a short random time then clear
                        timeout = setTimeout(() => { if (mounted) setIsError(false); }, Math.random() * 1000 + 300);
                    }
                    scheduleNext();
                    return;
                }

                const newOpacity = toggles % 2 === 0 ? Math.random() * 0.4 + 0.05 : 1;
                setOpacity(newOpacity);
                toggles++;

                // Random duration for this state (20ms to 120ms)
                const duration = Math.random() * 100 + 20;
                // On the first down toggle, if this sequence will error, activate error
                if (willError && toggles === 1) {
                    setIsError(true);
                }

                timeout = setTimeout(toggle, duration);
            };

            toggle();
        };

        const scheduleNext = () => {
            if (!mounted) return;
            // More frequent overall: delay 300ms to 2500ms
            const delay = Math.random() * 2200 + 300;
            timeout = setTimeout(runFlickerSequence, delay);
        };

        // Initial start with small random delay
        timeout = setTimeout(scheduleNext, Math.random() * 800);

        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [errorChance, isError]);

    // Helper to render children or an "error" replacement when active
    const renderContent = () => {
        if (isError && replaceWithError) {
            return <span style={{ color: 'var(--red, #f87171)' }}>{errorLabel}</span>;
        }

        // If not replacing with error, we still tint the text when error state active
        if (isError) {
            return <span style={{ color: 'var(--red, #f87171)' }}>{children}</span>;
        }

        return children;
    };

    return (
        <span className={className} style={{ opacity, transition: 'opacity 30ms linear' }}>
            {renderContent()}
        </span>
    );
};

export default Flicker;
