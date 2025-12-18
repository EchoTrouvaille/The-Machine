
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { Surveillance } from './components/Surveillance';
import { Simulation } from './components/Simulation';
import { Intelligence } from './components/Intelligence';
import { MissionControl } from './components/MissionControl';
import { LandingPage } from './components/LandingPage';
import { Icons, POI_COLORS } from './constants';
import { InteractiveBox, DataFlow, ParallaxWrapper, CursorScanner } from './components/HUD';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MISSION_CONTROL);
  const [showIntro, setShowIntro] = useState(true);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.MISSION_CONTROL: return <MissionControl />;
      case AppMode.SURVEILLANCE: return <Surveillance />;
      case AppMode.SIMULATION: return <Simulation />;
      case AppMode.INTELLIGENCE: return <Intelligence />;
      case AppMode.SHUTDOWN: return (
        <div className="flex items-center justify-center h-full bg-black z-10 relative">
          <div className="text-red-600 text-5xl animate-pulse font-bold tracking-tighter uppercase text-center">
            Goodbye. Admin.<br/>
            <span className="text-sm opacity-50 mt-4 block">System Purge Initiated</span>
          </div>
        </div>
      );
      default: return null;
    }
  };

  if (showIntro) {
    return <LandingPage onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden select-none relative flex flex-col">
      <CursorScanner />
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <DataFlow />
      </div>

      <ParallaxWrapper>
        <div className="h-screen w-screen flex flex-col relative z-10 pointer-events-none">
          {/* Header */}
          <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md z-30 pointer-events-auto">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-500 text-2xl shadow-[0_0_15px_rgba(255,215,0,0.3)]">M</div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 animate-ping"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tighter uppercase leading-none text-white">The Machine</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">OS Build 4.1-VIRTUE // ADMIN ACCESS</p>
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <NavButton 
                active={mode === AppMode.MISSION_CONTROL} 
                onClick={() => handleModeChange(AppMode.MISSION_CONTROL)} 
                icon={<div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center font-bold text-[10px]">MC</div>} 
                label="Root" 
                tag="ID:ADMIN"
              />
              <NavButton 
                active={mode === AppMode.SURVEILLANCE} 
                onClick={() => handleModeChange(AppMode.SURVEILLANCE)} 
                icon={<Icons.Camera />} 
                label="Monitor" 
                tag="ID:CCTV"
              />
              <NavButton 
                active={mode === AppMode.INTELLIGENCE} 
                onClick={() => handleModeChange(AppMode.INTELLIGENCE)} 
                icon={<Icons.Search />} 
                label="Intel" 
                tag="ID:GROUND"
              />
              <NavButton 
                active={mode === AppMode.SIMULATION} 
                onClick={() => handleModeChange(AppMode.SIMULATION)} 
                icon={<Icons.Terminal />} 
                label="Predict" 
                tag="ID:VEO"
              />
              <NavButton 
                active={mode === AppMode.SHUTDOWN} 
                onClick={() => handleModeChange(AppMode.SHUTDOWN)} 
                icon={<div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-current rounded-full" /></div>} 
                label="Purge" 
                color={POI_COLORS.RED}
                tag="ID:EXIT"
              />
            </nav>
          </header>

          <main className="flex-1 relative z-20 pointer-events-auto">
            {renderContent()}
          </main>

          <footer className="h-10 border-t border-gray-800 bg-black/80 flex items-center justify-between px-6 text-[10px] text-gray-500 uppercase font-mono z-30 backdrop-blur-sm pointer-events-auto">
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>Nodes: 1,492,055 Online</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-500/50">
                <Icons.Terminal />
                <span className="animate-pulse tracking-widest text-[8px]">Watching relevant assets...</span>
              </div>
            </div>
            <div className="flex gap-4">
                <span>SATELLITE_LINK: LEO_V4</span>
                <span className="text-gray-400">{new Date().toLocaleTimeString()} | NYC</span>
            </div>
          </footer>
        </div>
      </ParallaxWrapper>
    </div>
  );
};

const NavButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  tag: string;
  color?: string;
}> = ({ active, onClick, icon, label, tag, color }) => (
  <button onClick={onClick}>
    <InteractiveBox label={tag} active={active} color={color || POI_COLORS.WHITE} className="w-20 h-14 flex flex-col items-center justify-center">
        <div className={`transition-colors duration-300 ${active ? 'text-yellow-500' : 'text-gray-500'}`}>
            {icon}
        </div>
        <span className={`text-[8px] uppercase font-bold mt-1 tracking-widest transition-colors duration-300 ${active ? 'text-yellow-500' : 'text-gray-600'}`}>
            {label}
        </span>
    </InteractiveBox>
  </button>
);

export default App;
