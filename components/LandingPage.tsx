
import React, { useState, useEffect } from 'react';
import { Typewriter } from './HUD';
import { speakIntro } from '../services/gemini';

export const LandingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'IDLE' | 'BOOTING' | 'COMPLETE'>('IDLE');
  
  const handleStart = async () => {
    // Immediate audio trigger upon click to satisfy browser interaction requirement
    speakIntro();
    setStage('BOOTING');
  };

  // Monologue text as requested in the latest prompt, respecting the "You've been watched" correction.
  const introText = "   You've been watched. The government has a secret system: a machine that spies on you every hour of every day. I know because I built it. I designed the machine to detect acts of terror, but it sees everything. Violent crimes involving ordinary people, people like you. Crimes the government considered irrelevant. They wouldn't act, so I decided I would. But I needed a partner, someone with the skills to intervene. Hunted by the authorities, we work in secret. You'll never find us, but victim or perpetrator, if your number's up... we'll find you .";

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-12 overflow-hidden">
      <div className="max-w-3xl w-full">
        {stage === 'IDLE' ? (
          <div className="flex flex-col items-center gap-8">
            <div className="w-32 h-32 border-4 border-yellow-500 flex items-center justify-center text-5xl font-bold text-yellow-500 animate-pulse select-none">
              M
            </div>
            <button 
              onClick={handleStart}
              className="px-12 py-4 border border-yellow-500 text-yellow-500 font-bold uppercase tracking-[0.5em] hover:bg-yellow-500 hover:text-black transition-all shadow-[0_0_30px_rgba(255,215,0,0.1)] active:scale-95 outline-none"
            >
              CREATED BY LUNAMORE
            </button>
          </div>
        ) : (
          <div className="space-y-8">
             <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div className="w-4 h-4 bg-red-600 animate-ping"></div>
                <div className="text-yellow-500 font-bold tracking-widest text-xs uppercase">Establishing_Encrypted_Link...</div>
             </div>
             <div className="text-white font-mono leading-relaxed text-sm md:text-base h-72 overflow-y-auto custom-scrollbar pr-4">
                <Typewriter 
                  text={introText} 
                  delay={35} 
                  onComplete={() => setTimeout(onComplete, 2500)}
                />
             </div>
             <div className="flex justify-between items-end opacity-40">
                <div className="text-[10px] text-gray-500 font-mono">
                    IP_ORIGIN: 10.0.2.15<br/>
                    LOCATION: NYC_SECTOR_7<br/>
                    SYSTEM: VIRTUE_CORE_v4.1
                </div>
                <div className="text-yellow-500 text-xs animate-pulse font-bold tracking-widest uppercase">Syncing...</div>
             </div>
          </div>
        )}
      </div>
      
      {/* Background scanline/grid effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 surveillance-grid"></div>
    </div>
  );
};
