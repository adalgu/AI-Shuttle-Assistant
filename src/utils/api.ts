import { config } from '../config/env';

const SUNO_API_BASE_URL = config.SUNO_API_BASE_URL;

export const retryFetch = async (
  url: string,
  options: RequestInit,
  maxRetries = 3,
  delay = 1000
): Promise<Response> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      throw new Error(`API call failed: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError || new Error('Failed after max retries');
};

export { SUNO_API_BASE_URL };
