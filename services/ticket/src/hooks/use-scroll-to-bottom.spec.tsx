import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollToBottom } from './use-scroll-to-bottom';

// Mock MutationObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let mutationCallback: MutationCallback;

class MockMutationObserver {
  constructor(callback: MutationCallback) {
    this.callback = callback;
    mutationCallback = callback;
  }

  callback: MutationCallback;
  observe = mockObserve;
  disconnect = mockDisconnect;
}

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();

// Create a test component that uses the hook
const TestComponent = () => {
  const [containerRef, endRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div ref={containerRef} data-testid="container">
      <div>Content</div>
      <div ref={endRef} data-testid="end">
        End
      </div>
    </div>
  );
};

describe('useScrollToBottom', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Replace the global MutationObserver with our mock
    global.MutationObserver = MockMutationObserver as any;
    
    // Mock Element.scrollIntoView
    Element.prototype.scrollIntoView = mockScrollIntoView;
  });

  it('should set up refs correctly', () => {
    render(<TestComponent />);

    // Check that the refs are attached to the correct elements
    const container = screen.getByTestId('container');
    const end = screen.getByTestId('end');

    expect(container).toBeDefined();
    expect(end).toBeDefined();
  });

  it('should set up a MutationObserver on the container', () => {
    render(<TestComponent />);

    // Check that observe was called
    expect(mockObserve).toHaveBeenCalled();

    // Check that observe was called with the right options
    expect(mockObserve).toHaveBeenCalledWith(expect.anything(), {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  });

  it('should disconnect the observer on unmount', () => {
    const { unmount } = render(<TestComponent />);

    // Unmount the component
    unmount();

    // Check that disconnect was called
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should add a scroll event listener to the container', () => {
    const addEventListenerSpy = vi.spyOn(Element.prototype, 'addEventListener');
    render(<TestComponent />);
    
    // Check that addEventListener was called with 'scroll'
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should remove the scroll event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(Element.prototype, 'removeEventListener');
    const { unmount } = render(<TestComponent />);
    
    unmount();
    
    // Check that removeEventListener was called with 'scroll'
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should scroll to bottom when mutation occurs and user has not scrolled up', () => {
    render(<TestComponent />);
    
    // Simulate a mutation
    if (mutationCallback) {
      mutationCallback([], null as any);
    }
    
    // Check that scrollIntoView was called
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'end' });
  });

  it('should not scroll to bottom when mutation occurs and user has scrolled up', () => {
    render(<TestComponent />);
    
    const container = screen.getByTestId('container');
    
    // Mock container properties for isNearBottom calculation
    Object.defineProperties(container, {
      scrollHeight: { value: 1000, configurable: true },
      scrollTop: { value: 400, configurable: true }, // Far from bottom
      clientHeight: { value: 400, configurable: true }
    });
    
    // Trigger scroll event to set userHasScrolled to true
    fireEvent.scroll(container);
    
    // Reset the mock to check if it's called again
    mockScrollIntoView.mockReset();
    
    // Simulate a mutation
    if (mutationCallback) {
      mutationCallback([], null as any);
    }
    
    // Check that scrollIntoView was not called
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('should scroll to bottom when mutation occurs and user is near bottom', () => {
    render(<TestComponent />);
    
    const container = screen.getByTestId('container');
    
    // First scroll up
    Object.defineProperties(container, {
      scrollHeight: { value: 1000, configurable: true },
      scrollTop: { value: 400, configurable: true }, // Far from bottom
      clientHeight: { value: 400, configurable: true }
    });
    
    fireEvent.scroll(container);
    
    // Then scroll back near bottom
    Object.defineProperties(container, {
      scrollHeight: { value: 1000, configurable: true },
      scrollTop: { value: 550, configurable: true }, // Near bottom (within threshold)
      clientHeight: { value: 400, configurable: true }
    });
    
    fireEvent.scroll(container);
    
    // Reset the mock to check if it's called again
    mockScrollIntoView.mockReset();
    
    // Simulate a mutation
    if (mutationCallback) {
      mutationCallback([], null as any);
    }
    
    // Check that scrollIntoView was called
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'end' });
  });
});
