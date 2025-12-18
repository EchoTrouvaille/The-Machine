
import React, { useState, useEffect } from 'react';
import { Typewriter } from './HUD';
import { speakIntro } from '../services/gemini';

export const LandingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'IDLE' | 'BOOTING' | 'COMPLETE'>('IDLE');
  
  const handleStart = async () => {
    setStage('BOOTING');
    await speakIntro();
  };

  const introText = "You are being watched. The government has a secret system: a machine that spies on you every hour of every day. I know because I built it. I designed the machine to detect acts of terror, but it sees everything. Violent crimes involving ordinary people, people like you. Crimes the government considered 'irrelevant'. They wouldn't act, so I decided I would. But I needed a partner, someone with the skills to intervene. Hunted by the authorities, we work in secret. You'll never find us, but victim or perpetrator, if your number's up... we'll find you.";

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-12 overflow-hidden">
      <div className="max-w-3xl w-full">
        {stage === 'IDLE' ? (
          <div className="flex flex-col items-center gap-8">
            <div className="w-32 h-32 border-4 border-yellow-500 flex items-center justify-center text-5xl font-bold text-yellow-500 animate-pulse">
              M
            </div>
            <button 
              onClick={handleStart}
              className="px-12 py-4 border border-yellow-500 text-yellow-500 font-bold uppercase tracking-[0.5em] hover:bg-yellow-500 hover:text-black transition-all"
            >
              Initialize Handshake
            </button>
          </div>
        ) : (
          <div className="space-y-8">
             <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div className="w-4 h-4 bg-red-600 animate-ping"></div>
                <div className="text-yellow-500 font-bold tracking-widest text-xs">SYSTEM_ESTABLISHING_ENCRYPTED_TUNNEL...</div>
             </div>
             <div className="text-white font-mono leading-relaxed text-sm h-64 overflow-y-auto custom-scrollbar pr-4">
                <Typewriter 
                  text={introText} 
                  delay={30} 
                  onComplete={() => setTimeout(onComplete, 2000)}
                />
             </div>
             <div className="flex justify-between items-end opacity-40">
                <div className="text-[10px] text-gray-500 font-mono">
                    IP: 192.168.1.0.1<br/>
                    LOC: NEW YORK CITY<br/>
                    OS: VIRTUE_v4.1
                </div>
                <div className="text-yellow-500 text-xs animate-pulse font-bold">LINKING...</div>
             </div>
          </div>
        )}
      </div>
      
      {/* Background scanline effect specific to landing */}
      <div className="absolute inset-0 pointer-events-none opacity-20 surveillance-grid"></div>
    </div>
  );
};
