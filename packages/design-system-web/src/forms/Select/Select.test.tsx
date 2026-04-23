import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="City" options={options} />);
    expect(screen.getByLabelText('City')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select options={options} placeholder="Pick one" />);
    expect(screen.getByRole('option', { name: 'Pick one' })).toBeInTheDocument();
  });

  it('marks disabled options', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('option', { name: 'Option C' })).toBeDisabled();
  });

  it('shows hint text', () => {
    render(<Select options={options} hint="Choose wisely" />);
    expect(screen.getByText('Choose wisely')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Select options={options} error="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('marks as aria-invalid when error', () => {
    render(<Select options={options} error="Required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('hides hint when error is present', () => {
    render(<Select options={options} hint="Helpful hint" error="Error" />);
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
