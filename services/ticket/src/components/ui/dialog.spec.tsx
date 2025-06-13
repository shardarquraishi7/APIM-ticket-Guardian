import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  it('renders dialog with all components correctly', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog Title</DialogTitle>
            <DialogDescription>Test Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
          <DialogFooter>
            <button>Footer Button</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    // Check if trigger button is rendered
    const triggerButton = screen.getByText('Open Dialog');
    expect(triggerButton).toBeInTheDocument();

    // Open dialog
    fireEvent.click(triggerButton);

    // Check if dialog content is rendered
    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Button')).toBeInTheDocument();

    // Check if close button is rendered
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

    // Test closing dialog
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
  });
});
