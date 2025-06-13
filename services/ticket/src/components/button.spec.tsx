import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders the button with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-purple-900');
  });

  it('applies the correct classes for different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    let button = screen.getByRole('button', { name: /default/i });
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('dark:bg-gray-800');

    rerender(<Button variant="purple">Purple</Button>);
    button = screen.getByRole('button', { name: /purple/i });
    expect(button).toHaveClass('bg-purple-900');
    expect(button).toHaveClass('dark:bg-purple-800');

    rerender(<Button variant="green">Green</Button>);
    button = screen.getByRole('button', { name: /green/i });
    expect(button).toHaveClass('bg-green-900');
    expect(button).toHaveClass('dark:bg-green-800');
  });

  it('applies the correct classes for different appearances', () => {
    const { rerender } = render(<Button appearance="solid">Solid</Button>);
    let button = screen.getByRole('button', { name: /solid/i });
    expect(button).toHaveClass('bg-purple-900');

    rerender(<Button appearance="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-purple-900');
  });

  it('applies the correct classes for different sizes', () => {
    const { rerender } = render(<Button size="xs">XS</Button>);
    let button = screen.getByRole('button', { name: /xs/i });
    expect(button).toHaveClass('text-xs');
    expect(button).toHaveClass('px-2');
    expect(button).toHaveClass('py-1');

    rerender(<Button size="sm">SM</Button>);
    button = screen.getByRole('button', { name: /sm/i });
    expect(button).toHaveClass('text-sm');
    expect(button).toHaveClass('px-5');
    expect(button).toHaveClass('py-1');

    rerender(<Button size="md">MD</Button>);
    button = screen.getByRole('button', { name: /md/i });
    expect(button).toHaveClass('text-base');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');

    rerender(<Button size="lg">LG</Button>);
    button = screen.getByRole('button', { name: /lg/i });
    expect(button).toHaveClass('text-lg');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
  });

  it('renders with leading and trailing icons', () => {
    const leadingIcon = <span data-testid="leading-icon">🔍</span>;
    const trailingIcon = <span data-testid="trailing-icon">→</span>;

    render(
      <Button leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        Search
      </Button>,
    );

    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes through additional props to the button element', () => {
    render(
      <Button disabled aria-label="Disabled button">
        Disabled
      </Button>,
    );
    const button = screen.getByRole('button', { name: /disabled/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Disabled button');
  });
});
