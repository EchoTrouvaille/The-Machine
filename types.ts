
export enum AppMode {
  MISSION_CONTROL = 'MISSION_CONTROL', // Central Chat/Command
  SURVEILLANCE = 'SURVEILLANCE',       // Live Audio/Video Interaction
  SIMULATION = 'SIMULATION',           // Image/Video Generation/Editing
  INTELLIGENCE = 'INTELLIGENCE',       // Search Grounding
  SHUTDOWN = 'SHUTDOWN'
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface Message {
  role: 'user' | 'machine';
  text: string;
  timestamp: number;
}
