import React from 'react';
import { THEME_BORDER, THEME_COLOR } from '../constants';

const KEYS = [
  ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACK'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', 'ENTER'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '\\'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
  ['CTRL', 'FN', 'SPACE', 'ALT', 'CTRL']
];

const VirtualKeyboard: React.FC = () => {
  const sendKey = (key: string) => {
    window.dispatchEvent(new CustomEvent('terminal-virtual-key', { detail: { key } }));
  };

  return (
    <div className="hidden lg:flex flex-col w-full h-full justify-center select-none p-1">
      {KEYS.map((row, rIdx) => (
        <div key={rIdx} className="flex flex-1 w-full gap-1 mb-1 last:mb-0">
          {row.map((key, kIdx) => {
            let widthClass = 'flex-1';
            if (key === 'SPACE') widthClass = 'flex-[6]';
            else if (key === 'ENTER' || key === 'SHIFT' || key === 'CAPS' || key === 'BACK') widthClass = 'flex-[1.5]';
            else if (key === 'TAB' || key === 'CTRL' || key === 'ALT' || key === 'FN') widthClass = 'flex-[1.2]';
            const sendVal = (() => {
              if (key === 'ENTER') return 'Enter';
              if (key === 'BACK') return 'Backspace';
              if (key === 'SPACE') return ' ';
              if (key === 'TAB') return '\t';
              return key.length === 1 ? key : key;
            })();

            return (
              <div
                key={kIdx}
                onClick={() => sendKey(sendVal)}
                className={`
                  ${widthClass}
                  relative
                  group
                  border ${THEME_BORDER}
                  bg-indigo-950/20
                  hover:bg-indigo-500 hover:text-black
                  active:scale-95
                  transition-all duration-75
                  flex items-center justify-center
                  rounded-sm
                  cursor-pointer
                `}
              >
                <span className={`text-xs xl:text-sm font-bold ${THEME_COLOR} group-hover:text-black`}>
                  {key}
                </span>
                <div className="absolute top-0 right-0 w-1 h-1 bg-indigo-500/30 group-hover:bg-black/30"></div>
                <div className="absolute bottom-0 left-0 w-1 h-1 bg-indigo-500/30 group-hover:bg-black/30"></div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;