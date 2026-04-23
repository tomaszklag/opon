import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StepIndicator, type Step } from './StepIndicator';

const steps: Step[] = [
  { label: 'Wybierz serwis', status: 'done' },
  { label: 'Wybierz termin', status: 'active' },
  { label: 'Potwierdź dane', status: 'upcoming' },
];

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    render(<StepIndicator steps={steps} />);
    expect(screen.getByText('Wybierz serwis')).toBeInTheDocument();
    expect(screen.getByText('Wybierz termin')).toBeInTheDocument();
    expect(screen.getByText('Potwierdź dane')).toBeInTheDocument();
  });

  it('renders as ordered list', () => {
    render(<StepIndicator steps={steps} />);
    expect(screen.getByRole('list', { name: 'Progress' })).toBeInTheDocument();
  });

  it('renders correct number of list items', () => {
    render(<StepIndicator steps={steps} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('applies done class to completed steps', () => {
    render(<StepIndicator steps={steps} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('done');
  });

  it('applies active class to current step', () => {
    render(<StepIndicator steps={steps} />);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveClass('active');
  });

  it('applies upcoming class to future steps', () => {
    render(<StepIndicator steps={steps} />);
    const items = screen.getAllByRole('listitem');
    expect(items[2]).toHaveClass('upcoming');
  });

  it('renders check icon for done steps', () => {
    const { container } = render(<StepIndicator steps={steps} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders step numbers for non-done steps', () => {
    render(<StepIndicator steps={steps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
