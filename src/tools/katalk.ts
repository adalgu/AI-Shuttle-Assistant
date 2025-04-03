import axios from 'axios';
import { ToolDefinition } from '../types/tools';

// Type guard for Axios errors
function isAxiosError(error: any): error is Error & {
  isAxiosError: true;
  response?: {
    data?: any;
    status?: number;
  };
  code?: string;
} {
  return error && error.isAxiosError === true;
}

export const sendKakaoTalkTool: ToolDefinition = {
  name: 'send_kakaotalk',
  description: 'Send a personal KakaoTalk message to a specific receiver',
  parameters: {
    type: 'object',
    properties: {
      receiver: {
        type: 'string',
        description: 'Receiver\'s KakaoTalk ID (e.g., "gunn.kim")',
      },
      message: {
        type: 'string',
        description: 'Message to send',
      },
    },
    required: ['receiver', 'message'],
  },
  handler: async (params) => {
    const { receiver, message } = params;

    try {
      console.log(
        `Attempting to send KakaoTalk message to ${receiver}: ${message}`
      );

      // Modify axios configuration to be more lenient
      const response = await axios.get(
        'http://api.noti.daumkakao.io/send/personal/kakaotalk',
        {
          params: {
            to: receiver,
            msg: message,
          },
          timeout: 10000,
          // Use a function that always returns true to allow all status codes
          validateStatus: () => true,
        }
      );

      console.log('KakaoTalk API Response:', response.data);

      // If status is 200, consider it a success
      if (response.status === 200) {
        return {
          status: 'success',
          message: `Message sent to ${receiver}`,
          details: response.data,
        };
      }

      // For non-200 status codes, return as an error
      return {
        status: 'error',
        message: `Failed to send message to ${receiver}`,
        details: {
          status: response.status,
          data: response.data,
        },
      };
    } catch (error: any) {
      console.error('KakaoTalk Message Send Error:', error);

      // More nuanced error handling
      if (isAxiosError(error)) {
        // Network errors or timeout
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
          console.warn(
            'Potential network issue, but message might have been sent'
          );
          return {
            status: 'warning',
            message: `Possible message send to ${receiver}`,
            details: {
              errorType: 'NetworkWarning',
              code: error.code,
              message: error.message,
            },
          };
        }

        // Other axios-specific errors
        return {
          status: 'error',
          message: `Failed to send message to ${receiver}`,
          details: {
            errorType: 'AxiosError',
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
          },
        };
      }

      // Catch-all for other unexpected errors
      return {
        status: 'error',
        message: `Failed to send message to ${receiver}`,
        details: {
          errorType: 'UnknownError',
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
};
