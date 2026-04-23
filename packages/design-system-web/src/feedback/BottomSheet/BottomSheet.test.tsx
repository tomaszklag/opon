import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BottomSheet } from './BottomSheet';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('BottomSheet', () => {
  it('renders children when open', () => {
    render(
      <BottomSheet isOpen onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>,
    );
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <BottomSheet isOpen onClose={() => {}} title="Filtry">
        <p>content</p>
      </BottomSheet>,
    );
    expect(screen.getByRole('heading', { name: 'Filtry' })).toBeInTheDocument();
  });

  it('renders close button when title is provided', () => {
    render(
      <BottomSheet isOpen onClose={() => {}} title="Filtry">
        content
      </BottomSheet>,
    );
    expect(screen.getByRole('button', { name: 'Zamknij' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen onClose={onClose} title="Filtry">
        content
      </BottomSheet>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls showModal when opened', () => {
    render(
      <BottomSheet isOpen onClose={() => {}}>
        content
      </BottomSheet>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('calls close when closed', () => {
    const { rerender } = render(
      <BottomSheet isOpen onClose={() => {}}>
        content
      </BottomSheet>,
    );
    rerender(
      <BottomSheet isOpen={false} onClose={() => {}}>
        content
      </BottomSheet>,
    );
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
