
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

// Audio decoding utility for PCM data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const speakIntro = async () => {  
  if (!process.env.API_KEY) {
    console.warn('⚠️ [speakIntro] GEMINI_API_KEY not set - skipping audio intro');
    return;
  }
    
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    console.log('⏳ [speakIntro] Sending request...');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: "You've been watched. The government has a secret system, a machine that spies on you every hour of every day. I know because I built it." }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Using Zephyr for a clean, clinical yet authoritative tone fitting 'The Machine'
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    console.log('✅ [speakIntro] Response received');
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.warn('⚠️ [speakIntro] No audio data in response');
      return;
    }

    console.log('✅ [speakIntro] Audio data found, decoding...');
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    console.log('✅ [speakIntro] Audio playing');
  } catch (err) {
    console.error('❌ [speakIntro] Audio generation failed:', err);
    console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  }
};

export const searchIntelligence = async (query: string) => {
  console.log('⏳ [searchIntelligence] Sending request...');
  
  if (!process.env.API_KEY) {
    console.error('❌ [searchIntelligence] GEMINI_API_KEY not set');
    throw new Error('GEMINI_API_KEY not configured. Set it in .env.local');
  }
  
  console.log('⏳ [searchIntelligence] Sending API request...');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are 'The Machine', an omniscient AI system from Person of Interest. Provide brief, clinical, and tactical intelligence reports. Use typewriter-style short sentences."
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })) || []
  };
};

export const generateTacticalImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  console.log('⏳ [generateTacticalImage] Sending request...');
  
  if (!process.env.API_KEY) {
    console.error('❌ [generateTacticalImage] GEMINI_API_KEY not set');
    throw new Error('GEMINI_API_KEY not configured. Set it in .env.local');
  }
  
  console.log('⏳ [generateTacticalImage] Sending request...');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [{ 
        text: `A high-contrast surveillance still, thermal or grainy CCTV aesthetic: ${prompt}. NYC streets, POI aesthetic, digital UI overlays.` 
      }] 
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);
  return imagePart?.inlineData?.data ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
};

export const animateAsset = async (base64Image: string, prompt: string) => {
  if (!process.env.API_KEY) {
    console.error('❌ [generateTacticalImage] GEMINI_API_KEY not set');
    throw new Error('GEMINI_API_KEY not configured. Set it in .env.local');
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Surveillance footage animation: ${prompt}`,
    image: {
      imageBytes: base64Image.split(',')[1],
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};
