import { useCallback } from 'react';
import { LOCAL_RELAY_SERVER_URL } from '../constants/config';

export function useConsoleInitialization() {
  const getApiKey = useCallback(() => {
    const apiKey = LOCAL_RELAY_SERVER_URL
      ? ''
      : localStorage.getItem('tmp::voice_api_key') ||
        prompt('OpenAI API Key') ||
        '';
    if (apiKey !== '') {
      localStorage.setItem('tmp::voice_api_key', apiKey);
    }
    return apiKey;
  }, []);

  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  return {
    apiKey: getApiKey(),
    resetAPIKey,
  };
}
