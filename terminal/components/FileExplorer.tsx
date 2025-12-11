import React from 'react';
import { Folder, FileText, Lock, Image as ImageIcon } from 'lucide-react';
import { THEME_BORDER, THEME_COLOR, THEME_BG } from '../constants';
import { FileItem } from '../types';

const REAL_FILES: FileItem[] = [
  { name: 'index.html', type: 'FILE', size: '25KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'script.js', type: 'FILE', size: '12KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'styles.css', type: 'FILE', size: '10KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'lanyard-3d.js', type: 'FILE', size: '6KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'skillset-order.js', type: 'FILE', size: '2KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'github-contributions.js', type: 'FILE', size: '7KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'serve.ps1', type: 'FILE', size: '1KB', permissions: '-rw-r--r--', date: 'NOV 25' },
  { name: 'Images', type: 'DIR', permissions: 'drwxr-xr-x', date: 'NOV 25' },
  { name: 'terminal', type: 'DIR', permissions: 'drwxr-xr-x', date: 'NOV 25' },
];

interface FileExplorerProps {
  isSpookyActive?: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ isSpookyActive = false }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className={`border-b ${THEME_BORDER} mb-2 pb-1 flex justify-between items-end`}>
        <h3 className={`${THEME_COLOR} text-sm tracking-widest`}>
          {isSpookyActive ? 'CORRUPTED' : 'FILESYSTEM'}
        </h3>
        <span className={`text-[10px] ${isSpookyActive ? 'text-red-500 animate-pulse' : 'text-indigo-700'}`}>
          {isSpookyActive ? 'system compromised' : '/home/guest'}
        </span>
      </div>

      {isSpookyActive ? (
        <div className="flex-1 flex items-center justify-center text-red-500 font-extrabold text-3xl md:text-4xl animate-pulse text-center px-10 drop-shadow-[0_0_18px_rgba(250,78,78,0.9)]">
          VINCE TRAPPED ME
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 overflow-y-auto pr-1">
            {REAL_FILES.map((file, idx) => (
              <div
                key={idx}
                role="button"
                onClick={() => window.dispatchEvent(new CustomEvent('terminal-open-file', { detail: { filename: file.name } }))}
                className={`group flex flex-col items-center justify-center p-2 border border-transparent hover:${THEME_BORDER} hover:${THEME_BG} cursor-pointer transition-all duration-150`}
              >
                <div className={`${THEME_COLOR} mb-2 opacity-80 group-hover:opacity-100`}>
                  {file.type === 'DIR' && <Folder size={32} strokeWidth={1.5} />}
                  {file.type === 'FILE' && file.name.endsWith('.dat') && <Lock size={32} strokeWidth={1.5} />}
                  {file.type === 'FILE' && file.name.endsWith('.png') && <ImageIcon size={32} strokeWidth={1.5} />}
                  {file.type === 'FILE' && !file.name.endsWith('.dat') && !file.name.endsWith('.png') && <FileText size={32} strokeWidth={1.5} />}
                </div>
                <span className={`text-[10px] ${THEME_COLOR} text-center truncate w-full`}>{file.name}</span>
                <span className="text-[8px] text-indigo-800">{file.size || 'DIR'}</span>
              </div>
            ))}
          </div>
          <div className={`mt-auto pt-2 border-t ${THEME_BORDER} text-[10px] text-indigo-700 flex justify-between`}>
            <span>USED: 89%</span>
            <span>FREE: 124GB</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FileExplorer;