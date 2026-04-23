import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders label', () => {
    render(<Chip label="Filter" />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders as interactive when onSelect is provided', () => {
    render(<Chip label="Filter" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('calls onSelect on click', () => {
    const onSelect = vi.fn();
    render(<Chip label="Filter" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect on Enter key', () => {
    const onSelect = vi.fn();
    render(<Chip label="Filter" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Filter' }), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('has aria-pressed when interactive', () => {
    render(<Chip label="Filter" selected onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Filter' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders remove button when onRemove is provided', () => {
    render(<Chip label="Tag" onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove Tag' })).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<Chip label="Tag" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tag' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when disabled', () => {
    const onSelect = vi.fn();
    render(<Chip label="Filter" onSelect={onSelect} disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies selected class', () => {
    render(<Chip label="Filter" selected onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Filter' })).toHaveClass('selected');
  });
});
