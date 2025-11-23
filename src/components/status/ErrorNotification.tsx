import { useConsole } from '../../contexts/ConsoleContext';
import { X } from 'react-feather';
import './ErrorNotification.scss';

export function ErrorNotification() {
  const { errorState, clearError } = useConsole();

  if (!errorState.hasError) {
    return null;
  }

  const getErrorIcon = () => {
    switch (errorState.errorType) {
      case 'network':
        return '🌐';
      case 'microphone':
        return '🎤';
      case 'connection':
        return '🔌';
      default:
        return '⚠️';
    }
  };

  return (
    <div className={`error-notification error-${errorState.errorType}`}>
      <div className="error-content">
        <span className="error-icon">{getErrorIcon()}</span>
        <div className="error-message">
          <strong>오류 발생</strong>
          <p>{errorState.errorMessage}</p>
        </div>
      </div>
      <button className="error-close" onClick={clearError}>
        <X size={18} />
      </button>
    </div>
  );
}
