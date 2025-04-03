import { useState } from 'react';
import { useConsole } from '../../contexts/ConsoleContext';
import { useConsoleHandlers } from '../../hooks/useConsoleHandlers';
import { ConversationItem } from '../conversation/ConversationItem';
import { Send } from 'react-feather';

export function Conversation() {
  const { items, client, isConnected } = useConsole();
  const { deleteConversationItem } = useConsoleHandlers();
  const [textInput, setTextInput] = useState('');

  const handleSendText = () => {
    if (textInput.trim() && isConnected) {
      client.sendUserMessageContent([
        {
          type: 'input_text',
          text: textInput.trim(),
        },
      ]);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="content-block conversation">
      <div className="content-block-title">conversation</div>
      <div className="content-block-body" data-conversation-content>
        {!items.length && `awaiting connection...`}
        {items.map((item) => (
          <ConversationItem
            key={item.id}
            item={item}
            onDelete={deleteConversationItem}
          />
        ))}
        <div className="conversation-item input-area">
          <div className="speaker user">
            <div>user</div>
          </div>
          <div className="speaker-content">
            <div className="message-input-container">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={!isConnected}
                className="message-input"
              />
              <button
                onClick={handleSendText}
                disabled={!isConnected || !textInput.trim()}
                className="send-button"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
