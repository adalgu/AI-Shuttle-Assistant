import { useEffect, RefObject, MutableRefObject } from 'react';
import { RealtimeEvent } from '../types/console';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';

export const useScrollEffect = (
  eventsScrollRef: RefObject<HTMLDivElement>,
  eventsScrollHeightRef: MutableRefObject<number>,
  realtimeEvents: RealtimeEvent[],
  items: ItemType[]
) => {
  // Events scroll effect
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  // Conversation scroll effect
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);
};
