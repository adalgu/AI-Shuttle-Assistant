import { ToolDefinition } from '../types/tools';
import { SUNO_API_BASE_URL, retryFetch } from '../utils/api';

export interface LyricsGenerationParams {
  prompt: string;
}

export interface LyricsResponse {
  text: string;
  title: string;
  status: string;
  error?: string;
}

export const lyricsGenerationTool: ToolDefinition = {
  name: 'generate_lyrics',
  description:
    '음악 가사를 생성합니다. 사용자와의 대화를 통해 발견한 소재를 입력하여 가사를 만듭니다. 어린이가 좋아하는 동요풍의 가사를 만듭니다. 가사는 한국어로 작성됩니다.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          '어떤 가사를 생성할지 요청하는 것. 앞서 사용자와의 대화를 통해서 발견한 소재를 입력하여 가사를 만들 예정.',
      },
    },
    required: ['prompt'],
  },
  handler: async (params: { [key: string]: any }): Promise<LyricsResponse> => {
    try {
      const { prompt } = params as LyricsGenerationParams;

      const response = await retryFetch(
        `${SUNO_API_BASE_URL}/api/generate_lyrics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      const result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format');
      }

      return {
        text: result.text,
        title: result.title,
        status: result.status,
      };
    } catch (error) {
      console.error('Lyrics generation failed:', error);
      return {
        text: '',
        title: '',
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
