// Environment variables in Create React App
// All variables are injected at build time

// For TypeScript, we need to declare the environment variables
// that are injected by Create React App
declare const process: {
  env: {
    REACT_APP_KAKAO_API_KEY?: string;
    REACT_APP_SLACK_WEBHOOK_URL?: string;
    REACT_APP_KAKAO_MOBILITY_API_KEY?: string;
    REACT_APP_SUNO_API_BASE_URL?: string;
    [key: string]: string | undefined;
  };
};

// Export environment variables with fallbacks
export const config = {
  KAKAO_API_KEY: process.env.REACT_APP_KAKAO_API_KEY || '',
  SLACK_WEBHOOK_URL: process.env.REACT_APP_SLACK_WEBHOOK_URL || '',
  KAKAO_MOBILITY_API_KEY: process.env.REACT_APP_KAKAO_MOBILITY_API_KEY || '',
  SUNO_API_BASE_URL: process.env.REACT_APP_SUNO_API_BASE_URL || 'https://suno-api-ochre-six.vercel.app',
};

// Log warning if environment variables are missing
if (
  !config.KAKAO_API_KEY || 
  !config.SLACK_WEBHOOK_URL || 
  !config.KAKAO_MOBILITY_API_KEY
) {
  console.warn('Some environment variables are missing. Check your .env file.');
  console.warn(
    'Using fallback values for development. DO NOT use in production!'
  );
}
