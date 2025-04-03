import { useEffect } from 'react';
import { instructions } from '../../utils/conversation_config.js';
import { RealtimeClientProps } from './types';
import { useRealtimeTools } from './useRealtimeTools';
import { useRealtimeEvents } from './useRealtimeEvents';

export const useRealtimeClient = ({
  client,
  wavStreamPlayer,
  setRealtimeEvents,
  setItems,
  setMemoryKv,
  setCanvasKv,
  setMarker,
  setCoords,
}: RealtimeClientProps) => {
  const { initializeTools } = useRealtimeTools({
    client,
    setMemoryKv,
    setCanvasKv,
    setMarker,
    setCoords,
  });

  const { initializeEventListeners } = useRealtimeEvents({
    client,
    wavStreamPlayer,
    setRealtimeEvents,
    setItems,
  });

  useEffect(() => {
    // Initialize session
    client.updateSession({ instructions });
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Initialize tools and event listeners
    initializeTools();
    initializeEventListeners();

    // Set initial items
    setItems(client.conversation.getItems());

    return () => {
      client.reset();
    };
  }, [client, initializeTools, initializeEventListeners, setItems]);
};
