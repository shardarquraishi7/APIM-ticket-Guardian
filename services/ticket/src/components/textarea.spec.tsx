import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders correctly with default props', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('passes additional props to the textarea element', () => {
    render(<Textarea disabled aria-label="Test textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('aria-label', 'Test textarea');
  });

  it('applies the default className', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('flex');
    expect(textarea).toHaveClass('min-h-[80px]');
    expect(textarea).toHaveClass('w-full');
    expect(textarea).toHaveClass('rounded-md');
    expect(textarea).toHaveClass('border');
  });

  it('applies additional className when provided', () => {
    render(<Textarea data-testid="textarea" className="custom-class" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
    expect(textarea).toHaveClass('flex'); // Still has default classes
  });

  it('forwards the ref to the textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(ref.current).toBe(textarea);
  });

  it('passes through additional props to the textarea element', () => {
    render(
      <Textarea
        data-testid="textarea"
        disabled
        maxLength={100}
        rows={5}
        aria-label="Description"
      />,
    );
    const textarea = screen.getByTestId('textarea');

    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('maxlength', '100');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('aria-label', 'Description');
  });

  it('handles user input correctly', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');

    await user.type(textarea, 'Hello, world!');
    expect(textarea).toHaveValue('Hello, world!');
  });
});
