import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomTabBar } from './BottomTabBar';

describe('BottomTabBar', () => {
  it('renders all three tabs', () => {
    render(<BottomTabBar activeTab="search" onTabChange={vi.fn()} />);
    expect(screen.getByText('Szukaj')).toBeInTheDocument();
    expect(screen.getByText('Rezerwacje')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
  });

  it('marks active tab with aria-current="page"', () => {
    render(<BottomTabBar activeTab="bookings" onTabChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const bookingsBtn = buttons.find((b) => b.textContent?.includes('Rezerwacje'));
    expect(bookingsBtn).toHaveAttribute('aria-current', 'page');
  });

  it('other tabs do not have aria-current', () => {
    render(<BottomTabBar activeTab="search" onTabChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const nonActive = buttons.filter((b) => !b.textContent?.includes('Szukaj'));
    nonActive.forEach((btn) => {
      expect(btn).not.toHaveAttribute('aria-current');
    });
  });

  it('calls onTabChange with correct tab id on click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<BottomTabBar activeTab="search" onTabChange={handleChange} />);
    await user.click(screen.getByText('Profil'));
    expect(handleChange).toHaveBeenCalledWith('profile');
  });

  it('has nav landmark with accessible label', () => {
    render(<BottomTabBar activeTab="search" onTabChange={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: /nawigacja główna/i })).toBeInTheDocument();
  });
});
