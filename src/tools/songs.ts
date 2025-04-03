import { ToolDefinition } from '../types/tools';
import { MemoryKV, Song } from '../types/console';

export const fetchSongsTool = (
  setMemoryKv: (fn: (kv: MemoryKV) => MemoryKV) => void
): ToolDefinition => ({
  name: 'fetch_songs',
  description:
    '음악 라이브러리에서 생성된 노래들을 가져옵니다. 라이브러리 보여줘, 음악 라이브러리 보여줘 등의 명령에 반응합니다.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async () => {
    try {
      const response = await fetch(
        'https://suno-api-ochre-six.vercel.app/api/get'
      );
      const songs = (await response.json()) as Song[];

      // Sort songs by creation date (newest first)
      const sortedSongs = songs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMemoryKv((memoryKv) => ({
        ...memoryKv,
        songs: sortedSongs,
      }));

      return { ok: true, count: songs.length };
    } catch (error) {
      console.error('Error fetching songs:', error);
      return { ok: false, error: 'Failed to fetch songs' };
    }
  },
});
