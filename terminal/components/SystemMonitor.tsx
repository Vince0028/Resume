import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { THEME_BORDER, THEME_COLOR, THEME_BG } from '../constants';
import Flicker from './Flicker';

const MonitorGraph = ({ label, data, color, error, redMask, redHistory }: { label: string, data: any[], color: string, error?: boolean, redMask?: number[], redHistory?: number[] }) => {
  
  const chartData = data.map((d, i) => {
    const point: any = { ...d };

    
    if (redHistory && redHistory.length === data.length) {
      const maxHist = Math.max(0, ...redHistory);
      for (let level = 1; level <= maxHist; level++) {
        point[`redHist${level}`] = redHistory[i] >= level ? d.value : undefined;
      }
    }

    
    if (redMask && redMask.length === data.length) {
      const maxLife = Math.max(0, ...redMask);
      for (let level = 1; level <= maxLife; level++) {
        point[`redMask${level}`] = redMask[i] >= level ? d.value : undefined;
      }
    }

    return point;
  });

  const maxHist = redHistory ? Math.max(0, ...redHistory) : 0;
  const maxLife = redMask ? Math.max(0, ...redMask) : 0;

  return (
    <div className={`flex flex-col flex-1 min-h-0 w-full border ${THEME_BORDER} ${THEME_BG} p-2 mb-2 relative overflow-hidden`}>
      <div className="flex justify-between items-center mb-1 z-10">
        <span className={`text-xs font-bold ${THEME_COLOR}`}>{label}</span>
        {error ? (
          <Flicker className={`text-xs ${THEME_COLOR}`} replaceWithError={false}>
            <span style={{ color: '#f87171' }}>error</span>
          </Flicker>
        ) : (
          <Flicker className={`text-xs ${THEME_COLOR}`}>{data[data.length - 1]?.value}%</Flicker>
        )}
      </div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
      <div className="flex-1 w-full min-h-0 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis domain={[0, 100]} hide />
            {}
            <Line
              type="linear"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            {}
            {Array.from({ length: maxHist }, (_, i) => i + 1).map(level => {
              const opacity = (level / (maxHist + 3)) * 0.45;
              return (
                <Line
                  key={`hist-${level}`}
                  type="linear"
                  dataKey={`redHist${level}`}
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  strokeOpacity={opacity}
                  connectNulls={false}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              );
            })}
            {}
            {Array.from({ length: maxLife }, (_, i) => i + 1).map(level => {
              const opacity = 0.6 + (level / (maxLife + 1)) * 0.4;
              return (
                <Line
                  key={`red-${level}`}
                  type="linear"
                  dataKey={`redMask${level}`}
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  strokeOpacity={opacity}
                  connectNulls={false}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SystemMonitor: React.FC<{ isSpookyActive?: boolean }> = ({ isSpookyActive = false }) => {
  const [cpuData, setCpuData] = useState<{ value: number }[]>(new Array(20).fill({ value: 0 }));
  const [memData, setMemData] = useState<{ value: number }[]>(new Array(20).fill({ value: 0 }));
  const [cpuError, setCpuError] = useState(false);
  const [memError, setMemError] = useState(false);
  const [cpuMask, setCpuMask] = useState<number[]>(new Array(20).fill(0));
  const [memMask, setMemMask] = useState<number[]>(new Array(20).fill(0));
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(20).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(new Array(20).fill(0));
  const [isBlinking, setIsBlinking] = useState(false);

  const getImagePath = (imageName: string) => {
    
    const basePath = import.meta.env.BASE_URL || '/';
    return `${basePath}Images/${imageName}`;
  };

  useEffect(() => {
    if (!isSpookyActive) {
      setIsBlinking(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    
    const scheduleBlink = () => {
      const waitTime = Math.random() * 2000 + 2000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, waitTime);
    };

    scheduleBlink();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      setIsBlinking(false);
    };
  }, [isSpookyActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      
      setCpuData(prev => {
        const prevValue = prev[prev.length - 1].value;
        let newValue;

        const rand = Math.random();
        if (rand < 0.1) {
          
          newValue = prevValue;
        } else if (rand < 0.6) {
          
          newValue = Math.floor(Math.random() * 70) + 5; 
        } else {
          
          const change = Math.floor(Math.random() * 30) - 15; 
          newValue = Math.max(5, Math.min(75, prevValue + change));
        }

        const next = [...prev.slice(1), { value: newValue }];
        return next;
      });
      setCpuMask(prev => {
        
        const shifted = prev.slice(1).map(v => Math.max(v - 1, 0));
        shifted.push(0);
        
        let cpuEvent = false;
        let cpuLen = 0;
        let cpuLife = 0;
        if (Math.random() < 0.08) {
          cpuEvent = true;
          cpuLen = Math.floor(Math.random() * 4) + 2; 
          cpuLife = Math.floor(Math.random() * 3) + 2; 
          for (let i = 0; i < cpuLen; i++) {
            const idx = shifted.length - 1 - i;
            if (idx >= 0) shifted[idx] = cpuLife;
          }
        }
        setCpuError(shifted.some(v => v > 0));
        return shifted;
      });

      
      setCpuHistory(prevHist => {
        const s = prevHist.slice(1); 
        s.push(0);
        
        setCpuMask(currentMask => {
          const hasNewEvent = currentMask[currentMask.length - 1] > 0;
          if (hasNewEvent) {
            
            for (let i = 0; i < 5; i++) {
              const idx = s.length - 1 - i;
              if (idx >= 0 && currentMask[currentMask.length - 1 - i] > 0) {
                s[idx] = 10; 
              }
            }
          }
          return currentMask;
        });
        return s;
      });

      
      setMemData(prev => {
        const prevValue = prev[prev.length - 1].value;
        let newValue;

        const rand = Math.random();
        if (rand < 0.1) {
          
          newValue = prevValue;
        } else if (rand < 0.55) {
          
          newValue = Math.floor(Math.random() * 50) + 20; 
        } else {
          
          const change = Math.floor(Math.random() * 25) - 12; 
          newValue = Math.max(20, Math.min(70, prevValue + change));
        }

        const next = [...prev.slice(1), { value: newValue }];
        return next;
      });
      setMemMask(prev => {
        const shifted = prev.slice(1).map(v => Math.max(v - 1, 0));
        shifted.push(0);
        
        let memEvent = false;
        let memLen = 0;
        let memLife = 0;
        if (Math.random() < 0.06) {
          memEvent = true;
          memLen = Math.floor(Math.random() * 4) + 2; 
          memLife = Math.floor(Math.random() * 3) + 2; 
          for (let i = 0; i < memLen; i++) {
            const idx = shifted.length - 1 - i;
            if (idx >= 0) shifted[idx] = memLife;
          }
        }
        setMemError(shifted.some(v => v > 0));
        return shifted;
      });

      
      setMemHistory(prevHist => {
        const s = prevHist.slice(1); 
        s.push(0);
        
        setMemMask(currentMask => {
          const hasNewEvent = currentMask[currentMask.length - 1] > 0;
          if (hasNewEvent) {
            
            for (let i = 0; i < 5; i++) {
              const idx = s.length - 1 - i;
              if (idx >= 0 && currentMask[currentMask.length - 1 - i] > 0) {
                s[idx] = 10; 
              }
            }
          }
          return currentMask;
        });
        return s;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="flex flex-col w-full h-full overflow-hidden relative">
      <div className={`border-b ${THEME_BORDER} mb-2 pb-1 shrink-0`}>
        <h3 className={`${THEME_COLOR} text-sm tracking-widest`}>SYSTEM MONITOR</h3>
      </div>

      {isSpookyActive ? (
        <div className="flex-1 flex items-center justify-center">
          <img
            src={isBlinking ? getImagePath('blink.png') : getImagePath('eye.png')}
            alt="System intrusion detected"
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain"
          />
        </div>
      ) : (
        <>
          <MonitorGraph label="CPU CORE 0" data={cpuData} color="#6366f1" error={cpuError} redMask={cpuMask} redHistory={cpuHistory} />
          <MonitorGraph label="MEMORY ALLOC" data={memData} color="#6366f1" error={memError} redMask={memMask} redHistory={memHistory} />

          <div className={`mt-auto shrink-0 border ${THEME_BORDER} p-2 text-xs ${THEME_COLOR}`}>
            <div className="flex justify-between">
              <span>UPTIME:</span>
              <span>412D 14H 22M</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>TEMP:</span>
              <span>42°C</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>FAN:</span>
              <span>2400 RPM</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemMonitor;