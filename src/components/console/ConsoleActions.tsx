import { useConsole } from '../../contexts/ConsoleContext';
import { useConsoleHandlers } from '../../hooks/useConsoleHandlers';
import { Button } from '../button/Button';
import { Toggle } from '../toggle/Toggle';
import { X, Zap } from 'react-feather';

export function ConsoleActions() {
  const { isConnected, canPushToTalk, isRecording } = useConsole();
  const {
    handleTurnEndTypeChange,
    connectConversation,
    disconnectConversation,
    startRecording,
    stopRecording,
  } = useConsoleHandlers();

  return (
    <div className="content-actions">
      <Toggle
        defaultValue={false}
        labels={['타자모드on', '음성모드on']}
        values={['none', 'server_vad']}
        onChange={handleTurnEndTypeChange}
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
        label={isConnected ? '운행종료' : '운행시작'}
        iconPosition={isConnected ? 'end' : 'start'}
        icon={isConnected ? X : Zap}
        buttonStyle={isConnected ? 'regular' : 'action'}
        onClick={isConnected ? disconnectConversation : connectConversation}
      />
    </div>
  );
}
