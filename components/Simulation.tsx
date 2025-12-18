
import React, { useState } from 'react';
import { generateTacticalImage, animateAsset } from '../services/gemini';
import { Icons, POI_COLORS } from '../constants';
import { Typewriter, TacticalOverlay, BoundingBox } from './HUD';

export const Simulation: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [probability, setProbability] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setLoading(true);
    setStatus('CONSULTING NANO BANANA PREDICTION ENGINE...');
    setImage(null);
    setVideo(null);
    setProbability(null);

    try {
      const res = await generateTacticalImage(prompt);
      if (res) {
        setImage(res);
        setProbability(Math.floor(Math.random() * 45) + 35);
        setStatus('PREDICTION LOADED.');
      } else {
        setStatus('SYSTEM ERROR: UNABLE TO RENDER ASSET.');
      }
    } catch (e) {
      console.error(e);
      setStatus('CRITICAL ERROR: SIMULATION ABORTED.');
    } finally {
      setLoading(false);
    }
  };

  const checkVeoKey = async () => {
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }
    handleAnimate();
  };

  const handleAnimate = async () => {
    if (!image) return;
    setLoading(true);
    setStatus('EXTRAPOLATING VEO VECTOR DATA...');
    try {
      const res = await animateAsset(image, prompt || "Asset simulation");
      setVideo(res);
      setProbability(prev => Math.min(99, (prev || 50) + 20));
      setStatus('VECTOR EXTRAPOLATION COMPLETE.');
    } catch (e) {
      console.error(e);
      setStatus('ERROR: VIDEO ENGINE UNSTABLE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#030303] text-white font-mono overflow-hidden relative">
      {showOverlay && (
        <TacticalOverlay 
          title="Tactical Prediction" 
          objective="UTILIZE THE NANO BANANA ENGINE TO VISUALIZE POTENTIAL SCENARIOS. ENTER PARAMETERS TO GENERATE SURVEILLANCE EVIDENCE."
          onClose={() => setShowOverlay(false)}
        />
      )}

      {/* Sidebar */}
      <div className="w-80 border-r border-gray-800 p-6 flex flex-col gap-6 bg-gray-950 z-10">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-blue-400 uppercase tracking-tighter">Prediction Module</h2>
          <p className="text-[10px] text-gray-500">ENGINE: NANO BANANA v2.5</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Scenario Parameters</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.G. ASSET MEETING IN SUBWAY AT 03:00..."
              className="w-full bg-black border border-gray-700 p-3 text-xs outline-none focus:border-blue-500 h-32 resize-none transition-all text-blue-100"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 text-black font-bold uppercase transition-all tracking-widest text-xs"
          >
            {loading ? 'Analyzing...' : 'Execute Simulation'}
          </button>
        </div>

        {probability !== null && (
          <div className="mt-auto p-4 border border-blue-900 bg-blue-950 bg-opacity-20 space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-blue-300">Confidence Rate</span>
                <span className={`text-sm font-bold ${probability > 60 ? 'text-green-400' : 'text-yellow-400'}`}>{probability}%</span>
             </div>
             <div className="h-1 bg-gray-900">
                <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${probability}%` }} />
             </div>
             <div className="text-[9px] text-gray-500 italic">MODEL VALIDATED VIA QUANTUM BRUTE-FORCE.</div>
          </div>
        )}
      </div>

      {/* Viewport */}
      <div className="flex-1 relative flex flex-col">
        <div className="h-12 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950">
            <div className="flex items-center gap-4 text-[10px] uppercase">
                <span className="text-gray-500">Target_ID:</span>
                <span className="text-white">SIG_{Math.floor(Math.random()*9999)}</span>
                <div className="h-3 w-[1px] bg-gray-800"></div>
                <span className="text-gray-500">Status:</span>
                <span className={loading ? 'text-yellow-500 animate-pulse' : 'text-blue-400'}>
                    {loading ? 'Rendering...' : image ? 'Asset Loaded' : 'Standing By'}
                </span>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-black">
          <div className="relative w-full max-w-4xl aspect-video border border-gray-800 bg-gray-950 overflow-hidden shadow-2xl group">
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-90 z-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-blue-400 text-[10px] uppercase tracking-[0.3em]">
                    <Typewriter text={status} delay={30} />
                </div>
              </div>
            )}

            {video ? (
              <video src={video} autoPlay loop muted className="w-full h-full object-cover grayscale contrast-125 brightness-75" />
            ) : image ? (
              <img src={image} className="w-full h-full object-cover grayscale contrast-125 brightness-75 transition-all duration-500" alt="Tactical Frame" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-10">
                <Icons.Terminal />
                <span className="text-[10px] tracking-[0.8em] uppercase font-bold">Awaiting Data Entry</span>
              </div>
            )}

            {(image || video) && !loading && (
                <div className="absolute inset-0 pointer-events-none p-6">
                    <BoundingBox label="Asset Identified" color={POI_COLORS.BLUE} className="top-1/3 left-1/4 w-40 h-40" />
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 border border-gray-800 p-2 text-[8px] text-gray-400">
                        NANO_BNN_SIM_v2.5 // {new Date().toISOString()}
                    </div>
                </div>
            )}
          </div>
        </div>

        {image && !loading && !video && (
            <div className="p-6 border-t border-gray-800 flex justify-center bg-gray-950">
                <button 
                    onClick={checkVeoKey}
                    className="flex items-center gap-3 px-10 py-3 border border-purple-500 text-purple-400 hover:bg-purple-900 hover:bg-opacity-20 transition-all uppercase text-[10px] font-bold tracking-[0.2em]"
                >
                    <Icons.Camera /> Extrapolate Vector (VEO)
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
