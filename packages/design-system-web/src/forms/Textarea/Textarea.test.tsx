import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Notes" />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<Textarea placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    render(<Textarea label="Notes" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(<Textarea label="Notes" hint="Max 300 chars" />);
    expect(screen.getByText('Max 300 chars')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Textarea label="Notes" error="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('marks as aria-invalid when error', () => {
    render(<Textarea label="Notes" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('hides hint when error is present', () => {
    render(<Textarea label="Notes" hint="Helpful hint" error="Error message" />);
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
  });

  it('shows char counter when maxLength set', () => {
    render(<Textarea label="Notes" maxLength={200} />);
    expect(screen.getByText('0/200')).toBeInTheDocument();
  });

  it('updates counter on input', () => {
    render(<Textarea label="Notes" maxLength={200} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(screen.getByText('5/200')).toBeInTheDocument();
  });

  it('calls onChange', () => {
    const onChange = vi.fn();
    render(<Textarea label="Notes" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea label="Notes" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
