import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavStreamPlayer } from '../../lib/wavtools/index.js';
import {
  RealtimeEvent,
  MemoryKV,
  Coordinates,
  CanvasKV,
} from '../../types/console';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';

export interface RealtimeClientProps {
  client: RealtimeClient;
  wavStreamPlayer: WavStreamPlayer;
  setRealtimeEvents: (fn: (events: RealtimeEvent[]) => RealtimeEvent[]) => void;
  setItems: (items: ItemType[]) => void;
  setMemoryKv: (fn: (kv: MemoryKV) => MemoryKV) => void;
  setCanvasKv: (fn: (kv: CanvasKV) => CanvasKV) => void;
  setMarker: (coords: Coordinates | null) => void;
  setCoords: (coords: Coordinates) => void;
}

export interface RealtimeToolsProps {
  client: RealtimeClient;
  setMemoryKv: (fn: (kv: MemoryKV) => MemoryKV) => void;
  setCanvasKv: (fn: (kv: CanvasKV) => CanvasKV) => void;
  setMarker: (coords: Coordinates | null) => void;
  setCoords: (coords: Coordinates) => void;
}

export interface RealtimeEventsProps {
  client: RealtimeClient;
  wavStreamPlayer: WavStreamPlayer;
  setRealtimeEvents: (fn: (events: RealtimeEvent[]) => RealtimeEvent[]) => void;
  setItems: (items: ItemType[]) => void;
}
