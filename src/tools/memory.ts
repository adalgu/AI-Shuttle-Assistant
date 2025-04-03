import { ToolDefinition } from '../types/tools';
import { MemoryKV } from '../types/console';

export const setMemoryTool = (
  setMemoryKv: (fn: (kv: MemoryKV) => MemoryKV) => void
): ToolDefinition => ({
  name: 'set_memory',
  description: 'Saves important data about the user into memory.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The key of the memory value. Always use lowercase and underscores, no other characters.',
      },
      value: {
        type: 'string',
        description: 'Value can be anything represented as a string',
      },
    },
    required: ['key', 'value'],
  },
  handler: async ({ key, value }: { [key: string]: any }) => {
    setMemoryKv((memoryKv) => {
      const newKv = { ...memoryKv };
      newKv[key] = value;
      return newKv;
    });
    return { ok: true };
  },
});
