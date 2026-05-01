import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Wpisz tekst" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label and associates it with input', () => {
    render(<Input label="Telefon" id="phone" />);
    expect(screen.getByLabelText('Telefon')).toBeInTheDocument();
  });

  it('marks required field visually', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message and sets aria-invalid', () => {
    render(<Input label="Telefon" error="Nieprawidłowy numer" id="tel" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Nieprawidłowy numer');
  });

  it('shows hint when no error', () => {
    render(<Input label="Email" hint="Wyślemy potwierdzenie" id="email" />);
    expect(screen.getByText('Wyślemy potwierdzenie')).toBeInTheDocument();
  });

  it('hides hint when error is shown', () => {
    render(<Input label="Email" hint="Hint" error="Błąd" id="email" />);
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
    expect(screen.getByText('Błąd')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'abc');
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
