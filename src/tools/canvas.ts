import { ToolDefinition } from '../types/tools';
import { CanvasKV } from '../types/console';

export const setCanvasTool = (
  setCanvasKv: (fn: (kv: CanvasKV) => CanvasKV) => void
): ToolDefinition => ({
  name: 'set_canvas',
  description:
    'Saves story and lyrics content to be displayed in the main canvas view.',
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
        description: 'Story or lyrics content as a string',
      },
      content_type: {
        type: 'string',
        description: 'Type of content being set ("story" or "lyrics")',
      },
    },
    required: ['key', 'value', 'content_type'],
  },
  handler: async ({ key, value, content_type }: { [key: string]: any }) => {
    if (content_type !== 'story' && content_type !== 'lyrics') {
      throw new Error(
        'This tool only handles story or lyrics content. For music content, use set_music_canvas tool.'
      );
    }

    setCanvasKv((canvasKv) => {
      const newKv = { ...canvasKv };

      if (!newKv.stories) {
        newKv.stories = [];
      }

      // Both story and lyrics content will be added to stories array
      newKv.stories = [...newKv.stories, value];

      return newKv;
    });
    return { ok: true };
  },
});
