import { ToolDefinition } from '../types/tools';
import axios from 'axios';
import { config } from '../config/env';

// Use environment variable instead of hardcoded API key

interface KakaoAddressResponse {
  documents: Array<{
    x: string; // longitude
    y: string; // latitude
  }>;
}

export const getCoordinatesTool: ToolDefinition = {
  name: 'get_coordinates',
  description: 'Convert an address to coordinates using Kakao Local API',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'Korean address to convert to coordinates',
      },
    },
    required: ['address'],
  },
  handler: async (params: { [key: string]: any }) => {
    const { address } = params;
    
    try {
      const response = await axios.get<KakaoAddressResponse>(
        'https://dapi.kakao.com/v2/local/search/address.json',
        {
      headers: {
        Authorization: `KakaoAK ${config.KAKAO_API_KEY}`,
      },
          params: {
            query: address,
          },
        }
      );

      if (response.status === 200 && response.data.documents.length > 0) {
        const { x: longitude, y: latitude } = response.data.documents[0];
        return {
          success: true,
          coordinates: {
            longitude,
            latitude,
          },
        };
      } else {
        return {
          success: false,
          error: 'Address not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
