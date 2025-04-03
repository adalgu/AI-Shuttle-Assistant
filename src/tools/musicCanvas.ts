import { ToolDefinition } from '../types/tools';
import { CanvasKV } from '../types/console';

interface MusicContent {
  image_url?: string;
  lyric?: string;
  audio_url?: string;
  video_url?: string;
  status: {
    image: 'pending' | 'complete' | 'error';
    audio: 'pending' | 'complete' | 'error';
    video: 'pending' | 'complete' | 'error';
  };
}

export const setMusicCanvasTool = (
  setCanvasKv: (fn: (kv: CanvasKV) => CanvasKV) => void
): ToolDefinition => ({
  name: 'set_music_canvas',
  description:
    'Saves music-related content (image, audio, video, lyrics) to be displayed in the main canvas view.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The key of the canvas value. Always use lowercase and underscores, no other characters.',
      },
      value: {
        type: 'string',
        description: 'Music content as a string (URL or text)',
      },
      content_type: {
        type: 'string',
        description:
          'Type of content being set (music_image, music_audio, music_video, music_lyric)',
      },
      status: {
        type: 'string',
        description: 'Status of the content (pending, complete, error)',
      },
    },
    required: ['key', 'value', 'content_type'],
  },
  handler: async ({
    key,
    value,
    content_type,
    status = 'complete',
  }: {
    [key: string]: any;
  }) => {
    try {
      setCanvasKv((canvasKv) => {
        const newKv = { ...canvasKv };

        // Initialize stories array if it doesn't exist
        if (!newKv.stories) {
          newKv.stories = [];
        }

        // Initialize music object if it doesn't exist
        if (!newKv.music) {
          newKv.music = {
            status: {
              image: 'pending',
              audio: 'pending',
              video: 'pending',
            },
          };
        }

        // Store the content key to track multiple songs
        if (!newKv.music[key]) {
          newKv.music[key] = {
            status: {
              image: 'pending',
              audio: 'pending',
              video: 'pending',
            },
          };
        }

        // Create display text based on content type
        let displayText = '';
        switch (content_type) {
          case 'music_image':
            newKv.music[key].image_url = value;
            newKv.music[key].status.image = status as
              | 'pending'
              | 'complete'
              | 'error';
            displayText = `<img src="${value}" alt="${key}" style="max-width: 100%; height: auto;">`;
            break;
          case 'music_audio':
            newKv.music[key].audio_url = value;
            newKv.music[key].status.audio = status as
              | 'pending'
              | 'complete'
              | 'error';
            displayText = `<audio controls src="${value}"></audio>`;
            break;
          case 'music_video':
            newKv.music[key].video_url = value;
            newKv.music[key].status.video = status as
              | 'pending'
              | 'complete'
              | 'error';
            displayText = `<video controls src="${value}" style="max-width: 100%;"></video>`;
            break;
          case 'music_lyric':
            newKv.music[key].lyric = value;
            displayText = value;
            break;
          default:
            throw new Error(`Invalid content type: ${content_type}`);
        }

        // Add content to stories array for display
        if (displayText) {
          newKv.stories = [...newKv.stories, displayText];
        }

        return newKv;
      });

      return { ok: true };
    } catch (error) {
      console.error('Failed to set music canvas:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        ok: false,
      };
    }
  },
});
