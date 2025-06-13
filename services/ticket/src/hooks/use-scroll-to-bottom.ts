import { type RefObject, useEffect, useRef, useState } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T | null>(null);
  const endRef = useRef<T | null>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  
  // Function to check if user is near bottom
  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;
    
    const threshold = 150; // pixels from bottom to consider "near bottom"
    const position = container.scrollHeight - container.scrollTop - container.clientHeight;
    return position < threshold;
  };

  useEffect(() => {
    const container = containerRef.current;
    
    if (container) {
      // Handle scroll events to detect manual scrolling
      const handleScroll = () => {
        const nearBottom = isNearBottom();
        setUserHasScrolled(!nearBottom);
      };
      
      container.addEventListener('scroll', handleScroll);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        // Only auto-scroll if user hasn't manually scrolled up
        // or if they've scrolled back to near the bottom
        if (!userHasScrolled || isNearBottom()) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, [userHasScrolled]);

  return [containerRef, endRef];
}
