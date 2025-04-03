import { createContext, useContext, ReactNode, useState, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import {
  RealtimeEvent,
  Coordinates,
  MemoryKV,
  CanvasKV,
} from '../types/console';
import { SAMPLE_RATE } from '../constants/config';

interface ConsoleContextType {
  items: ItemType[];
  setItems: (items: ItemType[]) => void;
  realtimeEvents: RealtimeEvent[];
  setRealtimeEvents: (fn: (events: RealtimeEvent[]) => RealtimeEvent[]) => void;
  expandedEvents: { [key: string]: boolean };
  setExpandedEvents: (
    expanded:
      | { [key: string]: boolean }
      | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })
  ) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  canPushToTalk: boolean;
  setCanPushToTalk: (can: boolean) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  memoryKv: MemoryKV;
  setMemoryKv: (fn: (kv: MemoryKV) => MemoryKV) => void;
  canvasKv: CanvasKV;
  setCanvasKv: (fn: (kv: CanvasKV) => CanvasKV) => void;
  coords: Coordinates;
  setCoords: (coords: Coordinates) => void;
  marker: Coordinates | null;
  setMarker: (marker: Coordinates | null) => void;
  wavRecorder: WavRecorder;
  wavStreamPlayer: WavStreamPlayer;
  client: RealtimeClient;
  startTimeRef: React.MutableRefObject<string>;
  clientCanvasRef: React.RefObject<HTMLCanvasElement>;
  serverCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ConsoleContext = createContext<ConsoleContextType | undefined>(
  undefined
);

interface ConsoleProviderProps {
  children: ReactNode;
  apiKey: string;
  relayServerUrl?: string;
}

export function ConsoleProvider({
  children,
  apiKey,
  relayServerUrl,
}: ConsoleProviderProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<MemoryKV>({});
  const [canvasKv, setCanvasKv] = useState<CanvasKV>({});
  const [coords, setCoords] = useState<Coordinates>({ lat: 0, lng: 0 });
  const [marker, setMarker] = useState<Coordinates | null>(null);

  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: SAMPLE_RATE })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: SAMPLE_RATE })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      relayServerUrl
        ? { url: relayServerUrl }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    )
  );
  const startTimeRef = useRef<string>(new Date().toISOString());
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <ConsoleContext.Provider
      value={{
        items,
        setItems,
        realtimeEvents,
        setRealtimeEvents,
        expandedEvents,
        setExpandedEvents,
        isConnected,
        setIsConnected,
        canPushToTalk,
        setCanPushToTalk,
        isRecording,
        setIsRecording,
        memoryKv,
        setMemoryKv,
        canvasKv,
        setCanvasKv,
        coords,
        setCoords,
        marker,
        setMarker,
        wavRecorder: wavRecorderRef.current,
        wavStreamPlayer: wavStreamPlayerRef.current,
        client: clientRef.current,
        startTimeRef,
        clientCanvasRef,
        serverCanvasRef,
      }}
    >
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (context === undefined) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
}
