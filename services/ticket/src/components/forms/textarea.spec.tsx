import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Enter description" />);
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('custom-class');
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    render(<Textarea error={errorMessage} />);
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('applies error styles when error prop is provided', () => {
    render(<Textarea error="Error message" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('border-red-500');
    expect(textarea).toHaveClass('focus:border-red-500');
    expect(textarea).toHaveClass('focus:ring-red-500');
  });

  it('passes additional props to the textarea element', () => {
    render(<Textarea disabled aria-label="Test textarea" rows={5} />);
    const textarea = screen.getByLabelText('Test textarea');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('rows', '5');
  });
});
