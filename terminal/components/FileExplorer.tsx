import React, { useState, useEffect } from 'react';
import { Folder, FileText, Lock, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { THEME_BORDER, THEME_COLOR, THEME_BG, FILE_SYSTEM, FileSystemNode } from '../constants';

interface FileExplorerProps {
  isSpookyActive?: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ isSpookyActive = false }) => {
  
  const rootNode: FileSystemNode = {
    name: '~',
    type: 'dir',
    children: FILE_SYSTEM,
    restricted: false
  };

  
  const [pathStack, setPathStack] = useState<FileSystemNode[]>([rootNode]);

  
  const currentFolder = pathStack[pathStack.length - 1];

  
  const pathString = pathStack.map(node => node.name).join('/').replace('~', '/home/guest');

  const handleNavigate = (node: FileSystemNode) => {
    if (node.type === 'dir') {
      if (node.restricted) {
        
        return;
      }
      setPathStack([...pathStack, node]);
    } else {
      
      window.dispatchEvent(new CustomEvent('terminal-open-file', { detail: { filename: node.name, path: node.path } }));
    }
  };

  const handleBack = () => {
    if (pathStack.length > 1) {
      setPathStack(pathStack.slice(0, -1));
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className={`border-b ${THEME_BORDER} mb-2 pb-1 flex justify-between items-end`}>
        <div className="flex items-center gap-2">
          {pathStack.length > 1 && (
            <button
              onClick={handleBack}
              className={`${THEME_COLOR} hover:text-indigo-400 transition-colors cursor-pointer`}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className={`${THEME_COLOR} text-sm tracking-widest`}>
            {isSpookyActive ? 'CORRUPTED' : 'FILESYSTEM'}
          </h3>
        </div>
        <span className={`text-[10px] ${isSpookyActive ? 'text-red-500 animate-pulse' : 'text-indigo-700'} truncate ml-2`}>
          {isSpookyActive ? 'system compromised' : pathString}
        </span>
      </div>

      {isSpookyActive ? (
        <div className="flex-1 flex items-center justify-center text-red-500 font-extrabold text-3xl md:text-4xl animate-pulse text-center px-10 drop-shadow-[0_0_18px_rgba(250,78,78,0.9)]">
          FOR I AM, I AM
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto pr-1 content-start">
            {}
            {currentFolder.children?.map((node, idx) => (
              <div
                key={idx}
                role="button"
                onClick={() => handleNavigate(node)}
                className={`group flex flex-col items-center justify-center p-2 border border-transparent hover:${THEME_BORDER} hover:${THEME_BG} cursor-pointer transition-all duration-150 rounded min-h-[80px]`}
              >
                <div className={`${THEME_COLOR} mb-2 opacity-80 group-hover:opacity-100 relative`}>
                  {node.restricted && (
                    <div className="absolute -top-1 -right-1 z-10 text-xs bg-black/50 rounded-full">
                      <Lock size={12} />
                    </div>
                  )}
                  {node.type === 'dir' && <Folder size={32} strokeWidth={1.5} />}
                  {node.type === 'file' && node.name.endsWith('.png') && <ImageIcon size={32} strokeWidth={1.5} />}
                  {node.type === 'file' && !node.name.endsWith('.png') && <FileText size={32} strokeWidth={1.5} />}
                </div>
                <span className={`text-[10px] ${THEME_COLOR} text-center break-words leading-tight w-full px-1`} title={node.name}>
                  {node.name}
                </span>
                <span className="text-[8px] text-indigo-800 uppercase mt-0.5">
                  {node.type === 'dir' ? 'DIR' : 'FILE'}
                </span>
              </div>
            ))}

            {(!currentFolder.children || currentFolder.children.length === 0) && (
              <div className="col-span-full text-center text-indigo-800 text-xs py-10">
                (Empty Directory)
              </div>
            )}
          </div>

          <div className={`mt-auto pt-2 border-t ${THEME_BORDER} text-[10px] text-indigo-700 flex justify-between`}>
            <span>ITEMS: {currentFolder.children?.length || 0}</span>
            <span>FREE: 124GB</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FileExplorer;