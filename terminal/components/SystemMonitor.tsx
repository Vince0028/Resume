import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { THEME_BORDER, THEME_COLOR, THEME_BG } from '../constants';

const MonitorGraph = ({ label, data, color }: { label: string, data: any[], color: string }) => {
  return (
    <div className={`flex flex-col flex-1 min-h-0 w-full border ${THEME_BORDER} ${THEME_BG} p-2 mb-2 relative overflow-hidden`}>
      <div className="flex justify-between items-center mb-1 z-10">
        <span className={`text-xs font-bold ${THEME_COLOR}`}>{label}</span>
        <span className={`text-xs ${THEME_COLOR}`}>{data[data.length - 1]?.value}%</span>
      </div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
      <div className="flex-1 w-full min-h-0 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={[0, 100]} hide />
            <Line 
              type="stepAfter" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SystemMonitor: React.FC = () => {
  const [cpuData, setCpuData] = useState<{value: number}[]>(new Array(20).fill({ value: 0 }));
  const [memData, setMemData] = useState<{value: number}[]>(new Array(20).fill({ value: 0 }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData(prev => {
        const next = [...prev.slice(1), { value: Math.floor(Math.random() * 40) + 10 }];
        return next;
      });
      setMemData(prev => {
        const next = [...prev.slice(1), { value: Math.floor(Math.random() * 20) + 40 }];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
       <div className={`border-b ${THEME_BORDER} mb-2 pb-1 shrink-0`}>
         <h3 className={`${THEME_COLOR} text-sm tracking-widest`}>SYSTEM MONITOR</h3>
       </div>
       
      <MonitorGraph label="CPU CORE 0" data={cpuData} color="#6366f1" />
      <MonitorGraph label="MEMORY ALLOC" data={memData} color="#6366f1" />
       
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
    </div>
  );
};

export default SystemMonitor;