import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

beforeEach(() => {
  // jsdom doesn't implement dialog API — simulate open/close state
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('Modal', () => {
  it('opens dialog when isOpen is true', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test">
        <p>body</p>
      </Modal>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Potwierdź">
        <p>treść</p>
      </Modal>,
    );
    expect(screen.getByText('Potwierdź')).toBeInTheDocument();
  });

  it('renders children inside body', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <p>Treść modala</p>
      </Modal>,
    );
    expect(screen.getByText('Treść modala')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test">
        <p>treść</p>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: /zamknij/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has aria-modal="true"', () => {
    const { container } = render(
      <Modal isOpen onClose={vi.fn()}>
        <p>treść</p>
      </Modal>,
    );
    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby when title is provided', () => {
    const { container } = render(
      <Modal isOpen onClose={vi.fn()} title="Test">
        <p>x</p>
      </Modal>,
    );
    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('calls close when isOpen changes to false', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()}>
        <p>x</p>
      </Modal>,
    );
    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>x</p>
      </Modal>,
    );
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
