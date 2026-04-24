'use client';
import React, { useState } from 'react';
import styles from './ImageCarousel.module.css';

export interface ImageCarouselItem {
  src: string;
  alt: string;
}

export interface ImageCarouselProps {
  images: ImageCarouselItem[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  if (images.length === 0) return null;

  return (
    <div
      className={[styles.carousel, className].filter(Boolean).join(' ')}
      aria-label={`Galeria zdjęć, ${images.length} zdjęć`}
    >
      <div className={styles.viewport}>
        <img
          key={active}
          src={images[active]!.src}
          alt={images[active]!.alt}
          className={styles.image}
        />

        {images.length > 1 && (
          <>
            <button
              className={[styles.navBtn, styles.prev].join(' ')}
              onClick={prev}
              aria-label="Poprzednie zdjęcie"
              type="button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              className={[styles.navBtn, styles.next].join(' ')}
              onClick={next}
              aria-label="Następne zdjęcie"
              type="button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <span className={styles.counter} aria-hidden="true">
              <strong>{active + 1}</strong>/{images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Wybierz zdjęcie">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Zdjęcie ${i + 1}`}
              className={[styles.dot, i === active ? styles.dotActive : null]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActive(i)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}
