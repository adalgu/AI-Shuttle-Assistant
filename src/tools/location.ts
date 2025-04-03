import { ToolDefinition } from '../types/tools';
import { Coordinates } from '../types/console';

export const updateLocationTool: ToolDefinition = {
  name: 'update_location',
  description: 'Updates the current location on the map',
  parameters: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        description: 'Latitude coordinate',
      },
      longitude: {
        type: 'number',
        description: 'Longitude coordinate',
      },
      timestamp: {
        type: 'number',
        description: 'Unix timestamp of the location update',
      },
    },
    required: ['latitude', 'longitude', 'timestamp'],
  },
  handler: async (params: { [key: string]: any }) => {
    const { latitude, longitude, timestamp } = params;
    const coords: Coordinates = {
      lat: latitude,
      lng: longitude,
    };
    
    return { success: true, coords };
  },
};
