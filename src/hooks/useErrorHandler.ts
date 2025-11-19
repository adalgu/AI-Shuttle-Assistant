import { useCallback, useState } from 'react';

export interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorType: 'network' | 'microphone' | 'connection' | 'general' | null;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    errorMessage: '',
    errorType: null,
  });

  const handleError = useCallback((error: any, type: ErrorState['errorType'] = 'general') => {
    console.error(`[${type}] Error:`, error);

    let message = '';

    switch (type) {
      case 'network':
        message = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
        break;
      case 'microphone':
        message = '마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
        break;
      case 'connection':
        message = 'AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        message = error?.message || '알 수 없는 오류가 발생했습니다.';
    }

    setErrorState({
      hasError: true,
      errorMessage: message,
      errorType: type,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorMessage: '',
      errorType: null,
    });
  }, []);

  return {
    errorState,
    handleError,
    clearError,
  };
};
