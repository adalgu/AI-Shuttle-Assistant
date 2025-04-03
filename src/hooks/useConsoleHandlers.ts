import { useCallback } from 'react';
import { useConsole } from '../contexts/ConsoleContext';
import { DEFAULT_COORDINATES } from '../constants/config';
import { RealtimeEvent, MemoryKV } from '../types/console';

export function useConsoleHandlers() {
  const {
    client,
    wavRecorder,
    wavStreamPlayer,
    setIsConnected,
    setRealtimeEvents,
    setItems,
    setMemoryKv,
    setCoords,
    setMarker,
    setIsRecording,
    startTimeRef,
  } = useConsole();

  const handleTurnEndTypeChange = useCallback(
    async (_: unknown, value: string) => {
      if (value === 'none' && wavRecorder.getStatus() === 'recording') {
        await wavRecorder.pause();
      }
      client.updateSession({
        turn_detection: value === 'none' ? null : { type: 'server_vad' },
      });
      if (value === 'server_vad' && client.isConnected()) {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }
      return value === 'none';
    },
    [client, wavRecorder]
  );

  const connectConversation = useCallback(async () => {
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents(() => []);
    setItems(client.conversation.getItems());

    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();

    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `안녕? 오늘도 안전하게 아이들을 태워보자. 판교영재학원 아이들 명단을 보여줘.`,
      },
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, [
    client,
    wavRecorder,
    wavStreamPlayer,
    setIsConnected,
    setRealtimeEvents,
    setItems,
    startTimeRef,
  ]);

  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents(() => []);
    setItems([]);
    setMemoryKv((prev: MemoryKV) => ({}));
    setCoords(DEFAULT_COORDINATES);
    setMarker(null);

    client.disconnect();
    await wavRecorder.end();
    await wavStreamPlayer.interrupt();
  }, [
    client,
    wavRecorder,
    wavStreamPlayer,
    setIsConnected,
    setRealtimeEvents,
    setItems,
    setMemoryKv,
    setCoords,
    setMarker,
  ]);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, [client, wavRecorder, wavStreamPlayer, setIsRecording]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    await wavRecorder.pause();
    client.createResponse();
  }, [client, wavRecorder, setIsRecording]);

  const deleteConversationItem = useCallback(
    async (id: string) => {
      client.deleteItem(id);
    },
    [client]
  );

  const formatTime = useCallback(
    (timestamp: string) => {
      const startTime = startTimeRef.current;
      const t0 = new Date(startTime).valueOf();
      const t1 = new Date(timestamp).valueOf();
      const delta = t1 - t0;
      const hs = Math.floor(delta / 10) % 100;
      const s = Math.floor(delta / 1000) % 60;
      const m = Math.floor(delta / 60_000) % 60;
      const pad = (n: number) => {
        let s = n + '';
        while (s.length < 2) {
          s = '0' + s;
        }
        return s;
      };
      return `${pad(m)}:${pad(s)}.${pad(hs)}`;
    },
    [startTimeRef]
  );

  return {
    handleTurnEndTypeChange,
    connectConversation,
    disconnectConversation,
    startRecording,
    stopRecording,
    deleteConversationItem,
    formatTime,
  };
}
