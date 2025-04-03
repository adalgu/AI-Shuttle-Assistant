import React from 'react';
import { ArrowUp, ArrowDown } from 'react-feather';
import { EventLogProps } from '../../types/console';

export const EventLog: React.FC<EventLogProps> = ({
  event: realtimeEvent,
  formatTime,
  isExpanded,
  onToggleExpand,
}) => {
  const count = realtimeEvent.count;
  const event = { ...realtimeEvent.event };

  if (event.type === 'input_audio_buffer.append') {
    event.audio = `[trimmed: ${event.audio.length} bytes]`;
  } else if (event.type === 'response.audio.delta') {
    event.delta = `[trimmed: ${event.delta.length} bytes]`;
  }

  return (
    <div className="event">
      <div className="event-timestamp">{formatTime(realtimeEvent.time)}</div>
      <div className="event-details">
        <div className="event-summary" onClick={onToggleExpand}>
          <div
            className={`event-source ${
              event.type === 'error' ? 'error' : realtimeEvent.source
            }`}
          >
            {realtimeEvent.source === 'client' ? <ArrowUp /> : <ArrowDown />}
            <span>
              {event.type === 'error' ? 'error!' : realtimeEvent.source}
            </span>
          </div>
          <div className="event-type">
            {event.type}
            {count && ` (${count})`}
          </div>
        </div>
        {isExpanded && (
          <div className="event-payload">{JSON.stringify(event, null, 2)}</div>
        )}
      </div>
    </div>
  );
};
