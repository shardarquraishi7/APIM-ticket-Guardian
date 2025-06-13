import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders correctly with options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Select options={options} className="custom-class" data-testid="select" />);
    expect(screen.getByTestId('select')).toHaveClass('custom-class');
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Please select an option';
    render(<Select options={options} error={errorMessage} />);
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('applies error styles when error prop is provided', () => {
    render(<Select options={options} error="Error message" data-testid="select" />);
    const select = screen.getByTestId('select');
    expect(select).toHaveClass('border-red-500');
    expect(select).toHaveClass('focus:border-red-500');
    expect(select).toHaveClass('focus:ring-red-500');
  });

  it('passes additional props to the select element', () => {
    render(<Select options={options} disabled aria-label="Test select" />);
    const select = screen.getByLabelText('Test select');
    expect(select).toBeDisabled();
  });

  it('renders correct option values', () => {
    render(<Select options={options} data-testid="select" />);
    const optionElements = screen.getAllByRole('option');
    expect(optionElements).toHaveLength(3);
    expect(optionElements[0]).toHaveValue('option1');
    expect(optionElements[1]).toHaveValue('option2');
    expect(optionElements[2]).toHaveValue('option3');
  });
});
