import { useCallback } from 'react';
import { useConsole } from '../../contexts/ConsoleContext';
import { Visualization } from '../visualization/Visualization';
import { EventLog } from '../events/EventLog';
import { useConsoleHandlers } from '../../hooks/useConsoleHandlers';

export function Events() {
  const {
    realtimeEvents,
    expandedEvents,
    setExpandedEvents,
    clientCanvasRef,
    serverCanvasRef,
  } = useConsole();
  const { formatTime } = useConsoleHandlers();

  const handleToggleExpand = useCallback(
    (eventId: string) => {
      setExpandedEvents((prev) => {
        const expanded = { ...prev };
        if (expanded[eventId]) {
          delete expanded[eventId];
        } else {
          expanded[eventId] = true;
        }
        return expanded;
      });
    },
    [setExpandedEvents]
  );

  return (
    <div className="content-block events">
      <Visualization
        clientCanvasRef={clientCanvasRef}
        serverCanvasRef={serverCanvasRef}
      />
      <div className="content-block-title">events</div>
      <div className="content-block-body">
        {!realtimeEvents.length && `awaiting connection...`}
        {realtimeEvents.map((realtimeEvent) => (
          <EventLog
            key={realtimeEvent.event.event_id}
            event={realtimeEvent}
            formatTime={formatTime}
            isExpanded={!!expandedEvents[realtimeEvent.event.event_id]}
            onToggleExpand={() =>
              handleToggleExpand(realtimeEvent.event.event_id)
            }
          />
        ))}
      </div>
    </div>
  );
}
