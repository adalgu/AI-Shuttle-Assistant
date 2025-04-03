import { useCallback } from 'react';
import { WavRecorder } from '../../lib/wavtools/index.js';
import { RealtimeEvent } from '../../types/console';
import { RealtimeEventsProps } from './types';

export const useRealtimeEvents = ({
  client,
  wavStreamPlayer,
  setRealtimeEvents,
  setItems,
}: RealtimeEventsProps) => {
  const handleRealtimeEvent = useCallback(
    (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    },
    [setRealtimeEvents]
  );

  const handleError = useCallback((event: any) => {
    console.error(event);
  }, []);

  const handleInterruption = useCallback(async () => {
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
  }, [client, wavStreamPlayer]);

  const handleConversationUpdate = useCallback(
    async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    },
    [client, wavStreamPlayer, setItems]
  );

  const initializeEventListeners = useCallback(() => {
    client.on('realtime.event', handleRealtimeEvent);
    client.on('error', handleError);
    client.on('conversation.interrupted', handleInterruption);
    client.on('conversation.updated', handleConversationUpdate);
  }, [
    client,
    handleRealtimeEvent,
    handleError,
    handleInterruption,
    handleConversationUpdate,
  ]);

  return {
    initializeEventListeners,
  };
};
