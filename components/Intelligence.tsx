
import React, { useState, useEffect } from 'react';
import { searchIntelligence } from '../services/gemini';
import { Typewriter, StatusIndicator, DataFlow, BoundingBox } from './HUD';
import { GroundingSource } from '../types';
import { POI_COLORS } from '../constants';

export const Intelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<string>('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapNodes, setMapNodes] = useState<{top: number, left: number, type: 'THREAT' | 'ASSET' | 'NEUTRAL'}[]>([]);

  useEffect(() => {
    // Initial map nodes
    setMapNodes([
        { top: 25, left: 30, type: 'ASSET' },
        { top: 45, left: 60, type: 'THREAT' },
        { top: 15, left: 75, type: 'NEUTRAL' },
        { top: 80, left: 20, type: 'ASSET' },
        { top: 60, left: 40, type: 'NEUTRAL' },
    ]);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await searchIntelligence(query);
      setReport(res.text);
      setSources(res.sources);
      // Shuffle nodes to simulate tracking update
      setMapNodes(prev => prev.map(n => ({...n, top: n.top + (Math.random()*4-2), left: n.left + (Math.random()*4-2)})));
    } catch (e) {
      console.error(e);
      setReport("COMMUNICATION ERROR. SATELLITE LINK COMPROMISED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#020202] text-gray-300 font-mono overflow-hidden relative">
      <DataFlow />
      
      <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full gap-6 relative z-10">
        <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4">
          <div>
            <div className="text-xs text-yellow-500 font-bold uppercase mb-1 tracking-[0.3em]">Neural Intelligence Node</div>
            <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Asset Dossier & Urban Mapping</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-600 uppercase mb-1">Map Resolution (Zoom)</span>
                <input 
                    type="range" min="1" max="4" step="1" 
                    value={zoomLevel} 
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-32 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
            </div>
            <StatusIndicator label="Satellite Link: Active" active={!loading} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
          {/* Left Column: Tactical Map */}
          <div className="col-span-5 bg-black border border-gray-800 relative overflow-hidden group">
             <div className="absolute inset-0 opacity-20 surveillance-grid"></div>
             
             {/* Dynamic Map Visualization */}
             <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out" style={{ transform: `scale(${1 + (zoomLevel-1)*0.6})` }}>
                <div className="relative w-full h-full">
                    {/* Fake Urban Layout Grid (Visual Decoration) */}
                    <div className="absolute inset-0 border border-yellow-500/10 grid grid-cols-8 grid-rows-8">
                        {Array.from({length: 64}).map((_, i) => <div key={i} className="border-[0.5px] border-yellow-500/5"></div>)}
                    </div>

                    {/* Heatmap Nodes */}
                    {mapNodes.map((node, i) => {
                        const color = node.type === 'THREAT' ? POI_COLORS.RED : node.type === 'ASSET' ? POI_COLORS.WHITE : POI_COLORS.YELLOW;
                        return (
                            <div 
                                key={i} 
                                className="absolute transition-all duration-1000" 
                                style={{ top: `${node.top}%`, left: `${node.left}%` }}
                            >
                                {/* Heatmap Pulse */}
                                <div className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/5 animate-pulse blur-xl"></div>
                                
                                {zoomLevel >= 3 ? (
                                    <BoundingBox 
                                        label={node.type === 'THREAT' ? `TGT_${800+i}` : `AST_${100+i}`} 
                                        color={color} 
                                        className="w-20 h-20 -translate-x-1/2 -translate-y-1/2"
                                        subtext={node.type === 'THREAT' ? "H_PRIORITY" : "SECURED"}
                                    />
                                ) : zoomLevel === 2 ? (
                                    <div className="relative group/node">
                                        <div className="w-4 h-4 -translate-x-1/2 -translate-y-1/2 border border-current animate-ping" style={{ color }}></div>
                                        <div className="w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-current" style={{ color }}></div>
                                        <div className="absolute -top-8 -left-8 whitespace-nowrap text-[8px] bg-black/80 p-1 border border-gray-800 opacity-0 group-hover/node:opacity-100 transition-opacity">
                                            POS: {node.top.toFixed(2)} / {node.left.toFixed(2)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-60 shadow-[0_0_8px_rgba(255,215,0,0.5)]" style={{ color }}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
             </div>

             <div className="absolute top-4 left-4 text-[9px] text-yellow-500 font-bold uppercase tracking-widest bg-black/80 px-2 py-1 border border-yellow-500/20">
                Urban_Grid_Sector: NY_04 // RESOLUTION: {zoomLevel}X
             </div>
             
             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div className="text-[8px] text-gray-600 font-bold uppercase bg-black/40 p-1">
                    Coord: 40.7128 N, 74.0060 W<br/>
                    Alt: {1420 + zoomLevel * 100}m
                </div>
                <div className="w-16 h-16 border border-gray-800 flex flex-col items-center justify-center text-[10px] bg-black/80 text-yellow-500 font-bold">
                    <span className="text-[7px] text-gray-600">ZOOM</span>
                    {zoomLevel}.0
                </div>
             </div>
          </div>

          {/* Center Column: Intelligence Report */}
          <div className="col-span-4 flex flex-col gap-6">
            <form onSubmit={handleSearch} className="relative">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="INPUT PARAMETERS..."
                className="w-full bg-gray-950 border border-gray-800 p-3 pl-10 text-xs outline-none focus:border-yellow-500 text-white font-bold tracking-widest transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <div className="flex-1 bg-gray-950 border border-gray-800 p-6 relative overflow-y-auto custom-scrollbar shadow-inner">
                <div className="absolute top-0 right-0 p-2 text-[8px] text-gray-800 font-bold">DOSSIER_v9.3</div>
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-3 bg-gray-900 w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-900 w-5/6 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="h-3 bg-gray-900 w-4/6 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                ) : report ? (
                    <div className="text-xs leading-relaxed text-gray-300">
                        <Typewriter text={report} delay={8} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full opacity-10 flex-col gap-4">
                        <div className="text-[10px] tracking-[1em] uppercase animate-pulse">Ready for Analysis</div>
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Evidence List */}
          <div className="col-span-3 flex flex-col gap-4">
            <div className="flex-1 bg-black border border-gray-800 p-4 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] text-yellow-500 font-bold uppercase mb-4 border-b border-gray-900 pb-2 flex justify-between">
                    <span>Verified Intel Sources</span>
                    <span className="opacity-30">[{sources.length}]</span>
                </div>
                <div className="space-y-3">
                    {sources.map((s, idx) => (
                        <a 
                            key={idx} href={s.uri} target="_blank" rel="noreferrer" 
                            className="block p-3 border border-gray-900 hover:border-yellow-600 bg-gray-950/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/20 group-hover:bg-yellow-500 transition-colors"></div>
                            <div className="text-[8px] text-gray-600 uppercase mb-1">DATA_POINT_{idx+1}</div>
                            <div className="text-[10px] text-gray-300 font-bold group-hover:text-yellow-500 truncate">{s.title || 'Extracted Fragment'}</div>
                        </a>
                    ))}
                    {sources.length === 0 && <div className="text-[9px] text-gray-700 italic border border-dashed border-gray-800 p-4 text-center">No evidence compiled.</div>}
                </div>
            </div>
            <div className="h-24 bg-blue-900/5 border border-blue-900/20 p-3 flex flex-col justify-center gap-1 relative overflow-hidden">
                <div className="absolute right-[-10px] top-[-10px] text-blue-500/5 text-4xl font-bold">LOG</div>
                <div className="text-[8px] uppercase font-bold text-blue-400 opacity-60">System Log</div>
                <div className="text-[7px] text-gray-600 leading-none">
                    [OK] SATELLITE_LINK_ESTABLISHED<br/>
                    [OK] URBAN_GRID_READY<br/>
                    [OK] GROUNDING_ENGINE_ONLINE<br/>
                    [OK] ZOOM_CALIBRATION_SYNC
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
