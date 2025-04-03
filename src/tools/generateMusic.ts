import { ToolDefinition } from '../types/tools';
import { SUNO_API_BASE_URL, retryFetch } from '../utils/api';

export interface MusicGenerationParams {
  prompt: string;
  tags: string;
  title: string;
  make_instrumental?: boolean;
  wait_audio?: boolean;
}

export interface AudioInfo {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model_name: string;
  status: string;
  gpt_description_prompt: string;
  prompt: string;
  type: string;
  tags: string;
}

interface SuccessResponse {
  [key: number]: AudioInfo;
}

interface ErrorResponse {
  error: string;
}

export type MusicResponse = SuccessResponse | ErrorResponse;

export const musicGenerationTool: ToolDefinition = {
  name: 'generate_music',
  description:
    '음성으로 음악을 생성합니다. 음악 스타일이나 분위기를 설명하면 AI가 음악을 만들어줍니다. 생성이 완료되면 process_music_callback 도구를 사용하여 결과를 확인할 수 있습니다.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: '상세한 프롬프트 (가사 포함)',
      },
      tags: {
        type: 'string',
        description: '음악 장르 (예: pop metal male melancholic)',
      },
      title: {
        type: 'string',
        description: '음악 제목',
      },
      make_instrumental: {
        type: 'boolean',
        description: '반주만 생성할지 여부 (기본값: false)',
      },
      wait_audio: {
        type: 'boolean',
        description:
          '음악 생성 완료까지 대기할지 여부 (기본값: false, true로 설정 시 최대 100초 대기)',
      },
    },
    required: ['prompt', 'tags', 'title'],
  },
  handler: async (params: { [key: string]: any }): Promise<MusicResponse> => {
    try {
      const { prompt, tags, title, make_instrumental, wait_audio } =
        params as MusicGenerationParams;

      const response = await retryFetch(
        `${SUNO_API_BASE_URL}/api/custom_generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            tags,
            title,
            make_instrumental: make_instrumental || false,
            wait_audio: wait_audio || false,
          }),
        }
      );

      const result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format');
      }

      return result as SuccessResponse;
    } catch (error) {
      console.error('Music generation failed:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
