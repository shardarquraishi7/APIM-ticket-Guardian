import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MultimodalInput } from './multimodal-input';

describe('MultimodalInput', () => {
  const mockProps = {
    chatId: 'chat-123',
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    setMessages: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in idle state', () => {
    render(<MultimodalInput {...mockProps} />);

    expect(screen.getByPlaceholderText('Message SIA...')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('renders stop button when loading', () => {
    render(<MultimodalInput {...mockProps} isLoading={true} />);

    expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    expect(screen.queryByTestId('send-button')).not.toBeInTheDocument();
  });

  it('calls handleInputChange when typing', () => {
    render(<MultimodalInput {...mockProps} />);

    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(mockProps.handleInputChange).toHaveBeenCalled();
  });

  it('calls handleSubmit when send button is clicked', () => {
    render(<MultimodalInput {...mockProps} input="Hello" />);

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it('disables send button when input is empty', () => {
    render(<MultimodalInput {...mockProps} input="" />);

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has content', () => {
    render(<MultimodalInput {...mockProps} input="Hello" />);

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).not.toBeDisabled();
  });

  it('calls stop when stop button is clicked', () => {
    render(<MultimodalInput {...mockProps} isLoading={true} />);

    const stopButton = screen.getByTestId('stop-button');
    fireEvent.click(stopButton);

    expect(mockProps.stop).toHaveBeenCalled();
    expect(mockProps.setMessages).toHaveBeenCalled();
  });

  it('submits form when Enter is pressed without Shift', () => {
    render(<MultimodalInput {...mockProps} input="Hello" />);

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it('does not submit form when Enter is pressed with Shift', () => {
    render(<MultimodalInput {...mockProps} input="Hello" />);

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockProps.handleSubmit).not.toHaveBeenCalled();
  });

  it('does not submit form when Enter is pressed during loading', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<MultimodalInput {...mockProps} input="Hello" isLoading={true} />);

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(mockProps.handleSubmit).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Please wait for the model to finish its response!');

    consoleSpy.mockRestore();
  });
});
