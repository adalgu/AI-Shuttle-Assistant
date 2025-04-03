import { useCallback } from 'react';
import { RealtimeToolsProps } from './types';
import { setMemoryTool } from '../../tools/memory';
import { setCanvasTool } from '../../tools/canvas';
import { getWeatherTool } from '../../tools/weather';
import { lyricsGenerationTool } from '../../tools/generateLyrics';
import { musicGenerationTool } from '../../tools/generateMusic';
import { musicCallbackTool } from '../../tools/musicCallback';
import { fetchSongsTool } from '../../tools/songs';
import { setMusicCanvasTool } from '../../tools/musicCanvas';
import { sendKakaoTalkTool } from '../../tools/katalk';
import { sendSlackTool } from '../../tools/slack';
import { getCoordinatesTool } from '../../tools/address';
import { getMultiStopRouteTool } from '../../tools/route';
import {
  updateStudentListTool,
  getStudentsListTool,
  displayStudentsListTool,
} from '../../tools/students';
import { ToolDefinition } from '../../types/tools';

export const useRealtimeTools = ({
  client,
  setMemoryKv,
  setCanvasKv,
  setMarker,
  setCoords,
}: RealtimeToolsProps) => {
  const registerTool = useCallback(
    (tool: ToolDefinition) => {
      client.addTool(
        {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
        tool.handler
      );
    },
    [client]
  );

  const initializeTools = useCallback(() => {
    // System tools
    const memoryTool = setMemoryTool(setMemoryKv);
    const canvasTool = setCanvasTool(setCanvasKv);
    const weatherTool = getWeatherTool(setMarker, setCoords);
    const songsTool = fetchSongsTool(setMemoryKv);
    const musicCanvasTool = setMusicCanvasTool(setCanvasKv);
    registerTool(memoryTool);
    registerTool(canvasTool);
    registerTool(weatherTool);
    registerTool(songsTool);
    registerTool(musicCanvasTool);

    // Music generation tools
    registerTool(lyricsGenerationTool);
    registerTool(musicGenerationTool);
    registerTool(musicCallbackTool);

    // Messaging tools
    registerTool(sendKakaoTalkTool);
    registerTool(sendSlackTool);

    // Address to coordinates tool
    registerTool(getCoordinatesTool);

    // Student list tools
    registerTool(getStudentsListTool());
    registerTool(displayStudentsListTool(setMemoryKv));
    registerTool(updateStudentListTool(setMemoryKv));

    // Multi-stop route tool
    const multiStopRouteTool = getMultiStopRouteTool(setMemoryKv);
    registerTool(multiStopRouteTool);
  }, [client, setMemoryKv, setCanvasKv, setMarker, setCoords, registerTool]);

  return {
    initializeTools,
    registerTool,
  };
};
