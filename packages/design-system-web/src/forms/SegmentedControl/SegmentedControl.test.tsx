import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} value="day" onChange={() => {}} />);
    expect(screen.getByLabelText('Day')).toBeInTheDocument();
    expect(screen.getByLabelText('Week')).toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toBeInTheDocument();
  });

  it('has role="radiogroup"', () => {
    render(<SegmentedControl options={options} value="day" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('marks the active option as checked', () => {
    render(<SegmentedControl options={options} value="week" onChange={() => {}} />);
    expect(screen.getByLabelText('Week')).toBeChecked();
  });

  it('calls onChange with correct value', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="day" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Month'));
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('disables an option when disabled flag set', () => {
    const opts = [...options, { value: 'year', label: 'Year', disabled: true }];
    render(<SegmentedControl options={opts} value="day" onChange={() => {}} />);
    expect(screen.getByLabelText('Year')).toBeDisabled();
  });

  it('applies active class to selected option label', () => {
    render(<SegmentedControl options={options} value="week" onChange={() => {}} />);
    const labels = screen.getAllByText('Week');
    expect(labels[0]?.closest('label')).toHaveClass('active');
  });
});
