import React from 'react';
import { X } from 'react-feather';
import { ConversationItemProps } from '../../types/console';

export const ConversationItem: React.FC<ConversationItemProps> = ({
  item,
  onDelete,
}) => {
  return (
    <div className="conversation-item">
      <div className={`speaker ${item.role || ''}`}>
        <div>{(item.role || item.type).replaceAll('_', ' ')}</div>
        <div className="close" onClick={() => onDelete(item.id)}>
          <X />
        </div>
      </div>
      <div className={`speaker-content`}>
        {item.type === 'function_call_output' && (
          <div>{item.formatted.output}</div>
        )}
        {!!item.formatted.tool && (
          <div>
            {item.formatted.tool.name}({item.formatted.tool.arguments})
          </div>
        )}
        {!item.formatted.tool && item.role === 'user' && (
          <div>
            {item.formatted.transcript ||
              (item.formatted.audio?.length
                ? '(awaiting transcript)'
                : item.formatted.text || '(item sent)')}
          </div>
        )}
        {!item.formatted.tool && item.role === 'assistant' && (
          <div>
            {item.formatted.transcript || item.formatted.text || '(truncated)'}
          </div>
        )}
        {item.formatted.file && (
          <audio src={item.formatted.file.url} controls />
        )}
      </div>
    </div>
  );
};
