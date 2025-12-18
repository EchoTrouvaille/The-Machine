
import React, { useState, useEffect, useRef } from 'react';
import { POI_COLORS } from '../constants';

export const ParallaxWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (window.innerHeight / 2 - e.clientY) / 50;
    const y = (e.clientX - window.innerWidth / 2) / 100;
    setRotate({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="h-full w-full transition-transform duration-300 ease-out preserve-3d"
      style={{ transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
    >
      {children}
    </div>
  );
};

export const CursorScanner: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[100] mix-blend-screen opacity-40 font-mono text-[8px] text-yellow-500 overflow-hidden w-24 h-12"
      style={{ left: pos.x + 15, top: pos.y + 15 }}
    >
      <div className="animate-pulse">
        0x{Math.random().toString(16).slice(2, 10).toUpperCase()}<br/>
        SCAN_{Math.floor(Math.random()*1000)}<br/>
        LAT:{pos.y}.{Math.floor(Math.random()*99)}
      </div>
    </div>
  );
};

export const TargetingBox: React.FC<{ active: boolean; onComplete?: () => void }> = ({ active, onComplete }) => {
  const [locked, setLocked] = useState(false);
  
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        setLocked(true);
        onComplete?.();
      }, 1500);
      return () => {
        clearTimeout(timer);
        setLocked(false);
      };
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className={`relative border-2 border-yellow-500 transition-all duration-[1500ms] ease-in-out ${locked ? 'w-20 h-20 opacity-0' : 'w-64 h-64 opacity-100'}`}>
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500"></div>
      </div>
      {locked && (
        <div className="bg-red-600 text-black font-bold px-4 py-1 text-xs animate-bounce tracking-widest uppercase">
          [Target Acquired]
        </div>
      )}
    </div>
  );
};

export const BoundingBox: React.FC<{
  label: string;
  color?: string;
  className?: string;
  subtext?: string;
  style?: React.CSSProperties;
}> = ({ label, color = POI_COLORS.YELLOW, className = "", subtext, style }) => {
  return (
    <div className={`absolute border-2 flex flex-col ${className}`} style={{ ...style, borderColor: color }}>
      <div className="absolute top-0 left-0 p-1 bg-opacity-90 text-[10px] uppercase font-bold text-black flex justify-between items-center gap-2 whitespace-nowrap" style={{ backgroundColor: color }}>
        <span>{label}</span>
        {subtext && <span className="opacity-60 text-[8px]">{subtext}</span>}
      </div>
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: color }}></div>
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: color }}></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: color }}></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: color }}></div>
    </div>
  );
};

export const InteractiveBox: React.FC<{
  children: React.ReactNode;
  label: string;
  color?: string;
  active?: boolean;
  className?: string;
}> = ({ children, label, color = POI_COLORS.WHITE, active, className = "" }) => {
  const currentColor = active ? POI_COLORS.YELLOW : color;
  return (
    <div className={`relative p-1 border-2 transition-colors duration-300 ${className}`} style={{ borderColor: active ? POI_COLORS.YELLOW : 'transparent' }}>
       <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2" style={{ borderColor: currentColor }}></div>
       <div className="absolute -top-[2px] -right-[2px] w-3 h-3 border-t-2 border-r-2" style={{ borderColor: currentColor }}></div>
       <div className="absolute -bottom-[2px] -left-[2px] w-3 h-3 border-b-2 border-l-2" style={{ borderColor: currentColor }}></div>
       <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2" style={{ borderColor: currentColor }}></div>
       
       <div className="absolute -top-5 left-0 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentColor }}></div>
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70" style={{ color: currentColor }}>{label}</span>
       </div>
       {children}
    </div>
  );
};

export const VoiceWave: React.FC<{ active: boolean }> = ({ active }) => (
  <div className={`flex items-center gap-1 h-8 ${active ? 'opacity-100' : 'opacity-20'}`}>
    {[...Array(8)].map((_, i) => (
      <div 
        key={i} 
        className={`w-1 bg-yellow-500 rounded-full ${active ? 'animate-bounce' : ''}`} 
        style={{ 
          height: active ? `${20 + Math.random() * 60}%` : '20%',
          animationDelay: `${i * 0.1}s` 
        }}
      />
    ))}
  </div>
);

export const TacticalOverlay: React.FC<{ title: string; objective: string; onClose: () => void }> = ({ title, objective, onClose }) => (
  <div className="absolute inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-8 border-4 border-yellow-500 m-4 shadow-[0_0_100px_rgba(255,215,0,0.1)]">
    <div className="max-w-md w-full space-y-6 relative">
      <div className="text-yellow-500 font-bold text-2xl tracking-tighter border-b border-yellow-500 pb-2 uppercase">
        {title}
      </div>
      <div className="text-sm text-gray-300 font-mono leading-relaxed uppercase">
        <span className="text-yellow-500 font-bold block mb-2">Objective:</span>
        {objective}
      </div>
      <button 
        onClick={onClose}
        className="w-full py-4 bg-yellow-500 text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
      >
        Acknowledge & Deploy
      </button>
    </div>
  </div>
);

export const ThreatMeter: React.FC<{ level: number }> = ({ level }) => {
  const color = level > 70 ? POI_COLORS.RED : level > 30 ? POI_COLORS.YELLOW : POI_COLORS.BLUE;
  return (
    <div className="flex flex-col gap-1 w-32">
      <div className="flex justify-between text-[10px] uppercase font-bold" style={{ color }}>
        <span>Threat Level</span>
        <span>{level}%</span>
      </div>
      <div className="h-2 bg-gray-900 border border-gray-700 flex">
        <div 
          className="h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const Typewriter: React.FC<{ text: string; delay?: number; className?: string; onComplete?: () => void }> = ({ text, delay = 20, className = "", onComplete }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  React.useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay, onComplete]);
  return <span className={className}>{displayedText}</span>;
};

export const StatusIndicator: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div className="flex items-center gap-2 text-[10px] opacity-80 uppercase tracking-tighter border-l-2 border-gray-700 pl-2">
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-red-600 animate-pulse'}`}></div>
    <span className={active ? 'text-white' : 'text-gray-600'}>{label}</span>
  </div>
);

export const DataFlow: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden font-mono text-[8px] flex justify-around p-4 select-none z-0">
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-1 data-stream" style={{ animationDelay: `${i * -1.5}s`, opacity: 0.3 + Math.random() * 0.7 }}>
        {Array.from({ length: 80 }).map((_, j) => (
          <div key={j} className={Math.random() > 0.9 ? 'text-yellow-500 font-bold' : ''}>
            {Math.random().toString(16).substring(2, 8).toUpperCase()}
          </div>
        ))}
      </div>
    ))}
  </div>
);
