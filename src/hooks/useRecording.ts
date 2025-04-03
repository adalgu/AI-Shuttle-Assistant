import { useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';

interface UseRecordingProps {
  client: RealtimeClient;
  wavRecorder: WavRecorder;
  wavStreamPlayer: WavStreamPlayer;
  setIsRecording: (isRecording: boolean) => void;
}

export const useRecording = ({
  client,
  wavRecorder,
  wavStreamPlayer,
  setIsRecording,
}: UseRecordingProps) => {
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

  const changeTurnEndType = useCallback(
    async (value: string) => {
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

  return {
    startRecording,
    stopRecording,
    changeTurnEndType,
  };
};
