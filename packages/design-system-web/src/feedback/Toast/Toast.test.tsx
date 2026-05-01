import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster, toast } from './Toast';

describe('Toaster', () => {
  it('renders without crashing', () => {
    render(<Toaster />);
    // Toaster renders its container div
    expect(document.body).toBeInTheDocument();
  });
});

describe('toast API', () => {
  it('exports success, error, info functions', () => {
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.info).toBe('function');
  });

  it('toast.success returns an id', () => {
    render(<Toaster />);
    const id = toast.success('Rezerwacja potwierdzona!');
    expect(typeof id).toBe('string');
  });

  it('toast.error returns an id', () => {
    render(<Toaster />);
    const id = toast.error('Coś poszło nie tak');
    expect(typeof id).toBe('string');
  });

  it('toast.info returns an id', () => {
    render(<Toaster />);
    const id = toast.info('Informacja');
    expect(typeof id).toBe('string');
  });
});
