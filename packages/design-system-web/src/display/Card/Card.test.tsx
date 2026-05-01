import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Zawartość karty</Card>);
    expect(screen.getByText('Zawartość karty')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders as custom element when as prop is provided', () => {
    const { container } = render(<Card as="article">Test</Card>);
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('has role=button and is clickable when onClick is provided', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Karta</Card>);
    const card = screen.getByRole('button');
    await user.click(card);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('activates onClick via keyboard Enter', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Karta</Card>);
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });

  it('activates onClick via keyboard Space', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Karta</Card>);
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies hoverable class when hoverable is true', () => {
    const { container } = render(<Card hoverable>Karta</Card>);
    expect(container.firstChild).toHaveClass('hoverable');
  });
});
