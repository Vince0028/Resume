import React, { useState, useRef, useEffect } from 'react';
import { THEME_COLOR } from '../constants';

interface TerminalInputProps {
  onSubmit: (cmd: string) => void;
  disabled?: boolean;
  autoFocusEnabled?: boolean;
  disableNativeKeyboard?: boolean;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ onSubmit, disabled, autoFocusEnabled = true, disableNativeKeyboard = false }) => {
  const [value, setValue] = useState('');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue('');
  };

  useEffect(() => {
    const touch = typeof window !== 'undefined' && (
      'ontouchstart' in window ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      
      ((navigator as any).msMaxTouchPoints ?? 0) > 0
    );
    setIsTouchDevice(Boolean(touch));
  }, []);

  useEffect(() => {
    if (!autoFocusEnabled || isTouchDevice) return;
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [autoFocusEnabled, isTouchDevice]);

  useEffect(() => {
    const handler = (e: any) => {
      const k = e?.detail?.key;
      if (!k) return;
      if (k === 'Enter') {
        if (!value.trim()) { setValue(''); return; }
        onSubmit(value);
        setValue('');
        return;
      }
      if (k === 'Backspace') {
        setValue(v => v.slice(0, -1));
        return;
      }
      if (k === '\t') { setValue(v => v + '  '); return; }
      setValue(v => v + k);
      inputRef.current?.focus();
    };
    window.addEventListener('terminal-virtual-key', handler as EventListener);
    return () => window.removeEventListener('terminal-virtual-key', handler as EventListener);
  }, [value, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full mt-2">
      <span className={`${THEME_COLOR} mr-2 font-bold select-none`}>guest@benben-os:~$</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className={`flex-1 bg-transparent border-none outline-none ${THEME_COLOR} font-mono uppercase focus:ring-0 placeholder-indigo-900/50`}
        autoFocus={!isTouchDevice && autoFocusEnabled}
        inputMode={isTouchDevice && disableNativeKeyboard ? 'none' : 'text'}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
    </form>
  );
};

export default TerminalInput;