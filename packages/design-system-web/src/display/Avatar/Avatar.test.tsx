import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders initials from full name', () => {
    render(<Avatar name="Jan Kowalski" />);
    expect(screen.getByText('JK')).toBeInTheDocument();
  });

  it('renders first letter for single name', () => {
    render(<Avatar name="Admin" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);
    const img = screen.getByAltText('Test User');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('prefers image over initials when both src and name are provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="Jan Kowalski" />);
    expect(screen.getByAltText('Jan Kowalski')).toBeInTheDocument();
    expect(screen.queryByText('JK')).not.toBeInTheDocument();
  });

  it('renders placeholder when no src or name given', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<Avatar name="Jan" size="lg" />);
    expect(container.firstChild).toHaveClass('lg');
  });

  it('has accessible role when alt provided', () => {
    render(<Avatar alt="Profile picture" />);
    expect(screen.getByRole('img', { name: 'Profile picture' })).toBeInTheDocument();
  });
});
