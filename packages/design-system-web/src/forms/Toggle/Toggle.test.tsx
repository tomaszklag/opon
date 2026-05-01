import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders with label', () => {
    render(<Toggle label="Enable notifications" />);
    expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
  });

  it('has role="switch"', () => {
    render(<Toggle label="Enable" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Toggle label="Enable" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('can be checked by default', () => {
    render(<Toggle label="Enable" defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onChange on click', () => {
    const onChange = vi.fn();
    render(<Toggle label="Enable" onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Toggle label="Enable" disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('renders description text', () => {
    render(<Toggle label="SMS" description="Receive SMS updates" />);
    expect(screen.getByText('Receive SMS updates')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Toggle />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
