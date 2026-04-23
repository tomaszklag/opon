import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SideMenu, type SideMenuItem } from './SideMenu';

const ITEMS: SideMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <span>ico</span>,
  },
  {
    id: 'bookings',
    label: 'Rezerwacje',
    icon: <span>ico</span>,
  },
];

describe('SideMenu', () => {
  it('renders default items when no items prop given', () => {
    render(<SideMenu />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders provided items', () => {
    render(<SideMenu items={ITEMS} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Rezerwacje')).toBeInTheDocument();
  });

  it('marks active item with aria-current="page"', () => {
    render(<SideMenu items={ITEMS} activeItem="bookings" />);
    const buttons = screen.getAllByRole('button');
    const bookingsBtn = buttons.find((b) => b.textContent?.includes('Rezerwacje'));
    expect(bookingsBtn).toHaveAttribute('aria-current', 'page');
  });

  it('calls onItemClick with item id on click', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<SideMenu items={ITEMS} onItemClick={handleClick} />);
    await user.click(screen.getByText('Rezerwacje'));
    expect(handleClick).toHaveBeenCalledWith('bookings');
  });

  it('toggles collapsed state via collapse button', async () => {
    const user = userEvent.setup();
    render(<SideMenu items={ITEMS} />);
    const collapseBtn = screen.getByRole('button', { name: /zwiń menu/i });
    await user.click(collapseBtn);
    expect(screen.getByRole('button', { name: /rozwiń menu/i })).toBeInTheDocument();
  });

  it('hides item labels when collapsed', async () => {
    const user = userEvent.setup();
    render(<SideMenu items={ITEMS} />);
    await user.click(screen.getByRole('button', { name: /zwiń menu/i }));
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('has nav landmark with accessible label', () => {
    render(<SideMenu items={ITEMS} />);
    expect(screen.getByRole('navigation', { name: /menu panelu b2b/i })).toBeInTheDocument();
  });
});
