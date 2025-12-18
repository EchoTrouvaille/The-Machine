
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { BoundingBox, StatusIndicator, ThreatMeter, VoiceWave, TacticalOverlay, TargetingBox } from './HUD';
import { POI_COLORS } from '../constants';

const FRAME_RATE = 3;
const JPEG_QUALITY = 0.5;

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const Surveillance: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{role: string, text: string, type?: 'LOG' | 'GESTURE' | 'CHAT'}[]>([]);
  const [threatLevel, setThreatLevel] = useState(12);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isTargeting, setIsTargeting] = useState(false);
  
  const [trackedItems, setTrackedItems] = useState<{id: string, label: string, color: string, top: number, left: number, w: number, h: number}[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const logRef = useRef<HTMLDivElement>(null);

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  useEffect(() => {
    if (!isActive) {
      setTrackedItems([]);
      return;
    }
    const timer = setInterval(() => {
      setTrackedItems(prev => {
        const adminBox = {
          id: 'admin',
          label: 'ASSET: ADMIN',
          color: threatLevel > 70 ? POI_COLORS.RED : threatLevel > 30 ? POI_COLORS.YELLOW : POI_COLORS.WHITE,
          top: 25 + (Math.random() * 2 - 1),
          left: 35 + (Math.random() * 2 - 1),
          w: 30,
          h: 40
        };
        const results = [adminBox];
        if (threatLevel > 40 || Math.random() > 0.7) {
            results.push({
                id: 'sig-2',
                label: threatLevel > 60 ? 'THREAT: DETECTED' : 'IDENT: UNKNOWN',
                color: threatLevel > 60 ? POI_COLORS.RED : POI_COLORS.YELLOW,
                top: 10 + (Math.random() * 50),
                left: 60 + (Math.random() * 20),
                w: 15,
                h: 20
            });
        }
        return results;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [isActive, threatLevel]);

  const startSession = useCallback(async () => {
    if (sessionPromiseRef.current) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioContextRef.current.createGain();
    outputNode.connect(audioContextRef.current.destination);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setTranscription(prev => [...prev, {role: 'ANALYSIS', text: 'TACTICAL LINK ESTABLISHED. MONITORING BEHAVIORAL PATTERNS...', type: 'LOG'}]);
          },
          onmessage: async (message: LiveServerMessage) => {
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-20), {role: 'MACHINE', text, type: 'CHAT'}]);
              
              // Simulate gesture analysis based on model response keywords
              const lowerText = text.toLowerCase();
              if (lowerText.includes("waving") || lowerText.includes("wave")) {
                setTranscription(prev => [...prev.slice(-20), {role: 'ANALYSIS', text: '[GESTURE_DETECTED]: WAVE_SIG_01', type: 'GESTURE'}]);
              }
              if (lowerText.includes("moving") || lowerText.includes("motion")) {
                setTranscription(prev => [...prev.slice(-20), {role: 'ANALYSIS', text: '[MOTION_TRACKING]: ACTIVE_VECTORS', type: 'LOG'}]);
              }

              if (lowerText.includes("threat") || lowerText.includes("danger")) setThreatLevel(prev => Math.min(100, prev + 15));
              else if (lowerText.includes("safe") || lowerText.includes("clear")) setThreatLevel(prev => Math.max(5, prev - 10));
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev.slice(-20), {role: 'ADMIN', text, type: 'CHAT'}]);
            }
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsActive(false),
          onerror: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are 'The Machine'. Monitoring Admin. Acknowledge visual gestures like waving or movement. Be clinical. If you see a gesture, explicitly mention it (e.g., "I see you waving, Admin").`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      const interval = setInterval(() => {
        if (!videoRef.current || !canvasRef.current || !sessionPromiseRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } });
              });
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', JPEG_QUALITY);
      }, 1000 / FRAME_RATE);
      return () => { clearInterval(interval); sessionPromiseRef.current?.then(s => s.close()); };
    } catch (err) {
      console.error(err);
      setTranscription(prev => [...prev, {role: 'ERROR', text: 'HARDWARE LINK FAILED.', type: 'LOG'}]);
    }
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [transcription]);

  return (
    <div className="relative w-full h-full bg-black flex flex-col overflow-hidden border border-gray-800">
      {showOverlay && (
        <TacticalOverlay 
          title="Surveillance Handshake" 
          objective="MONITORING ACTIVE. WAVE OR MOVE TO TRIGGER GESTURE ANALYSIS LOGS. LONG-PRESS ON ASSETS TO LOCK TARGETS."
          onClose={() => setShowOverlay(false)}
        />
      )}

      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
        <div className="space-y-2">
            <StatusIndicator label="Live Neural Link" active={isActive} />
            <VoiceWave active={isActive} />
        </div>
        <ThreatMeter level={threatLevel} />
      </div>

      <div 
        className="relative flex-1 bg-black overflow-hidden group cursor-crosshair"
        onMouseDown={() => setIsTargeting(true)}
        onMouseUp={() => setIsTargeting(false)}
        onMouseLeave={() => setIsTargeting(false)}
      >
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'grayscale contrast-125 opacity-70' : 'opacity-20 blur-sm'}`} />
        <canvas ref={canvasRef} className="hidden" />
        
        <TargetingBox active={isTargeting} onComplete={() => {
          setThreatLevel(prev => Math.min(100, prev + 10));
          setTranscription(prev => [...prev.slice(-20), {role: 'ANALYSIS', text: '[ASSET_LOCK]: TARGET_ACQUIRED_BY_ADMIN', type: 'LOG'}]);
        }} />

        <div className="absolute inset-0 pointer-events-none">
          {trackedItems.map(item => (
            <BoundingBox key={item.id} label={item.label} color={item.color} className="absolute transition-all duration-150 ease-linear" style={{ top: `${item.top}%`, left: `${item.left}%`, width: `${item.w}%`, height: `${item.h}%` }} />
          ))}
          <div className="absolute inset-0 border-[20px] border-black opacity-40"></div>
          <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-white opacity-20"></div>
          <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-white opacity-20"></div>
        </div>

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
            <button onClick={startSession} className="px-12 py-5 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,215,0,0.2)]">Deploy Link</button>
          </div>
        )}
      </div>

      <div className="h-48 bg-gray-950 border-t border-gray-800 p-3 font-mono text-[10px] flex flex-col z-20 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-yellow-500/20 animate-pulse"></div>
        <div className="flex justify-between items-center mb-1 text-yellow-500 font-bold uppercase tracking-tighter border-b border-gray-900 pb-1">
            <span>Neural Transcription Stream // BEHAVIORAL_LOG</span>
            <span className="text-[8px] opacity-50">VIRTUE_CORE_v4</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2" ref={logRef}>
            {transcription.map((line, i) => (
              <div key={i} className={`flex gap-2 p-1 border-b border-gray-900/50 ${
                line.type === 'GESTURE' ? 'bg-yellow-500/10 text-yellow-500 font-bold' : 
                line.role === 'MACHINE' ? 'text-blue-400' : 
                line.role === 'ANALYSIS' ? 'text-green-400 italic' : 
                'text-gray-400'
              }`}>
                  <span className="opacity-40 flex-shrink-0 w-16">[{line.role}]</span>
                  <span className="flex-1">{line.text}</span>
                  {line.type === 'GESTURE' && <span className="text-[8px] animate-pulse">DETECTED</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
