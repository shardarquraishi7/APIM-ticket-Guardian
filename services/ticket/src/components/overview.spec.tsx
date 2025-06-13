import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Overview } from './overview';

describe('Overview', () => {
  it('renders correctly with default props', () => {
    render(<Overview />);
    expect(screen.getByTestId('overview-text')).toBeInTheDocument();
  });
});
