import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OTPInput } from './OTPInput';

describe('OTPInput', () => {
  it('renders 6 cells by default', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders custom length', () => {
    render(<OTPInput length={4} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('has group role with accessible label', () => {
    render(<OTPInput />);
    expect(screen.getByRole('group', { name: 'One-time password' })).toBeInTheDocument();
  });

  it('renders value digits', () => {
    render(<OTPInput value="123456" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[5]).toHaveValue('6');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<OTPInput onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0]!, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('disables all inputs when disabled', () => {
    render(<OTPInput disabled />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => expect(input).toBeDisabled());
  });

  it('applies error class when error prop is set', () => {
    render(<OTPInput error />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => expect(input).toHaveClass('error'));
  });

  it('handles backspace to clear a cell', () => {
    const onChange = vi.fn();
    render(<OTPInput value="12" onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[1]!, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith('1');
  });
});
