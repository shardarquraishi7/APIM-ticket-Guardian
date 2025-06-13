import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('renders correctly with children', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Label className="custom-class" data-testid="label">
        Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('custom-class');
  });

  it('applies error styles when error prop is true', () => {
    render(
      <Label error data-testid="label">
        Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-red-500');
  });

  it('passes additional props to the label element', () => {
    render(<Label htmlFor="test-input">Label</Label>);
    expect(screen.getByText('Label')).toHaveAttribute('for', 'test-input');
  });
});
