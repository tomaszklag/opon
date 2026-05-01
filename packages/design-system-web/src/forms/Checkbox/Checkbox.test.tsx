import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Checkbox label="Test" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('can be checked by default', () => {
    render(<Checkbox label="Test" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Test" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Checkbox label="Test" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('shows error message', () => {
    render(<Checkbox label="Test" error="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('marks input as aria-invalid when error is set', () => {
    render(<Checkbox label="Test" error="Required" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders without label', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
