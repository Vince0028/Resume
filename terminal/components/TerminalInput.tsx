import React, { useState, useRef, useEffect } from 'react';
import { THEME_COLOR } from '../constants';

interface TerminalInputProps {
  onSubmit: (cmd: string) => void;
  disabled?: boolean;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ onSubmit, disabled }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue('');
  };

  // Keep focus
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Listen for virtual keyboard events
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
      // Tab -> 2 spaces
      if (k === '\t') { setValue(v => v + '  '); return; }
      // Space or single character
      setValue(v => v + k);
      inputRef.current?.focus();
    };
    window.addEventListener('terminal-virtual-key', handler as EventListener);
    return () => window.removeEventListener('terminal-virtual-key', handler as EventListener);
  }, [value, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full mt-2">
      <span className={`${THEME_COLOR} mr-2 font-bold select-none`}>guest@cipher-os:~$</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className={`flex-1 bg-transparent border-none outline-none ${THEME_COLOR} font-mono uppercase focus:ring-0 placeholder-indigo-900/50`}
        autoFocus
        spellCheck={false}
        autoComplete="off"
      />
    </form>
  );
};

export default TerminalInput;