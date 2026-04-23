import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    const { container } = render(<StarRating value={3} readOnly />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });

  it('renders custom max stars', () => {
    const { container } = render(<StarRating value={2} max={3} readOnly />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(3);
  });

  it('has accessible sr-only label for read-only', () => {
    render(<StarRating value={4} readOnly />);
    expect(screen.getByText('4 out of 5 stars')).toBeInTheDocument();
  });

  it('renders interactive radiogroup', () => {
    render(<StarRating value={3} onChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Rating' })).toBeInTheDocument();
  });

  it('renders radio inputs in interactive mode', () => {
    render(<StarRating value={3} onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
  });

  it('marks the current value as checked', () => {
    render(<StarRating value={3} onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toBeChecked();
  });

  it('calls onChange when a star is clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('4 stars'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('applies filled class to stars up to value', () => {
    render(<StarRating value={3} readOnly />);
    const stars = document.querySelectorAll('.star');
    expect(stars[0]).toHaveClass('filled');
    expect(stars[2]).toHaveClass('filled');
    expect(stars[3]).not.toHaveClass('filled');
  });
});
