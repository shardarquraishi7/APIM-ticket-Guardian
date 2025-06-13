import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('custom-class');
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    render(<Input error={errorMessage} />);
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('applies error styles when error prop is provided', () => {
    render(<Input error="Error message" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveClass('focus:border-red-500');
    expect(input).toHaveClass('focus:ring-red-500');
  });

  it('passes additional props to the input element', () => {
    render(<Input disabled aria-label="Test input" />);
    const input = screen.getByLabelText('Test input');
    expect(input).toBeDisabled();
  });

  it('uses text as default type', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
  });

  it('can change input type', () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });
});
