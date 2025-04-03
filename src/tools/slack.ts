import axios from 'axios';
import { ToolDefinition } from '../types/tools';
import { config } from '../config/env';

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

export const sendSlackTool: ToolDefinition = {
  name: 'send_slack',
  description: 'Send a Slack message to the AI-Shuttle broadcast channel',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Message to send to the Slack channel',
      },
    },
    required: ['message'],
  },
  handler: async (params) => {
    const { message } = params;

    try {
      console.log(`Attempting to send Slack message: ${message}`);

      const payload = {
        channel: '#ai-shuttle-broadcast',
        'gunn.kim': 'webhookbot',
        text: message,
        icon_emoji: ':bus:',
      };

      const response = await axios.post(
        config.SLACK_WEBHOOK_URL,
        `payload=${JSON.stringify(payload)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
          validateStatus: () => true,
        }
      );

      console.log('Slack API Response:', response.data);

      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Message sent to Slack channel',
          details: response.data,
        };
      }

      return {
        status: 'error',
        message: 'Failed to send message to Slack',
        details: {
          status: response.status,
          data: response.data,
        },
      };
    } catch (error: any) {
      console.error('Slack Message Send Error:', error);

      if (isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
          return {
            status: 'warning',
            message: 'Network issue occurred while sending message',
            details: {
              errorType: 'NetworkWarning',
              code: error.code,
              message: error.message,
            },
          };
        }

        return {
          status: 'error',
          message: 'Failed to send message to Slack',
          details: {
            errorType: 'AxiosError',
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
          },
        };
      }

      return {
        status: 'error',
        message: 'Failed to send message to Slack',
        details: {
          errorType: 'UnknownError',
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
};
