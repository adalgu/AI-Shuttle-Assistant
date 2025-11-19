import { useConsole } from '../../contexts/ConsoleContext';
import { useConsoleHandlers } from '../../hooks/useConsoleHandlers';
import { Button } from '../button/Button';
import { Toggle } from '../toggle/Toggle';
import { X, Zap, Loader } from 'react-feather';

export function ConsoleActions() {
  const { isConnected, canPushToTalk, isRecording, connectionState } = useConsole();
  const {
    handleTurnEndTypeChange,
    connectConversation,
    disconnectConversation,
    startRecording,
    stopRecording,
  } = useConsoleHandlers();

  const isConnecting = connectionState === 'connecting' || connectionState === 'reconnecting';

  const getConnectionButtonLabel = () => {
    if (connectionState === 'connecting') return '연결 중...';
    if (connectionState === 'reconnecting') return '재연결 중...';
    return isConnected ? '운행종료' : '운행시작';
  };

  return (
    <div className="content-actions">
      <Toggle
        defaultValue={false}
        labels={['타자모드on', '음성모드on']}
        values={['none', 'server_vad']}
        onChange={handleTurnEndTypeChange}
        disabled={isConnecting}
      />
      <div className="spacer" />
      {isConnected && canPushToTalk && (
        <Button
          label={isRecording ? 'release to send' : 'AI호출'}
          buttonStyle={isRecording ? 'alert' : 'regular'}
          disabled={!isConnected || !canPushToTalk}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
        />
      )}
      <div className="spacer" />
      <Button
        label={getConnectionButtonLabel()}
        iconPosition={isConnected ? 'end' : 'start'}
        icon={isConnecting ? Loader : (isConnected ? X : Zap)}
        buttonStyle={isConnected ? 'regular' : 'action'}
        onClick={isConnected ? disconnectConversation : connectConversation}
        disabled={isConnecting}
      />
    </div>
  );
}
