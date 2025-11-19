import { useConsole } from '../../contexts/ConsoleContext';
import './StatusIndicator.scss';

export function StatusIndicator() {
  const { connectionState, permissionState, isRecording } = useConsole();

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return '연결됨';
      case 'connecting':
        return '연결 중...';
      case 'reconnecting':
        return '재연결 중...';
      case 'disconnected':
        return '연결 안됨';
      default:
        return '알 수 없음';
    }
  };

  const getConnectionStatusClass = () => {
    switch (connectionState) {
      case 'connected':
        return 'status-connected';
      case 'connecting':
      case 'reconnecting':
        return 'status-connecting';
      case 'disconnected':
        return 'status-disconnected';
      default:
        return '';
    }
  };

  const getMicrophoneStatusText = () => {
    switch (permissionState) {
      case 'granted':
        return isRecording ? '녹음 중' : '마이크 준비됨';
      case 'denied':
        return '마이크 권한 없음';
      case 'prompt':
        return '마이크 권한 필요';
      case 'checking':
        return '확인 중...';
      default:
        return '알 수 없음';
    }
  };

  const getMicrophoneStatusClass = () => {
    if (isRecording) {
      return 'status-recording';
    }
    switch (permissionState) {
      case 'granted':
        return 'status-ready';
      case 'denied':
        return 'status-denied';
      case 'prompt':
        return 'status-prompt';
      default:
        return '';
    }
  };

  return (
    <div className="status-indicator">
      <div className={`status-item ${getConnectionStatusClass()}`}>
        <div className="status-dot"></div>
        <span>{getConnectionStatusText()}</span>
      </div>
      <div className={`status-item ${getMicrophoneStatusClass()}`}>
        <div className="status-dot"></div>
        <span>{getMicrophoneStatusText()}</span>
      </div>
    </div>
  );
}
