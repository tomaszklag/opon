'use client';

import { useEffect, useRef, useState } from 'react';
import { Text } from '@opony/design-system-web';
import styles from './ScrolledLayout.module.css';

export interface ScrollSection {
  id: string;
  num: string;
  label: string;
  danger?: boolean;
  sectionClassName?: string;
  content: React.ReactNode;
}

interface Props {
  sections: ScrollSection[];
  tocLabel?: string;
}

export function ScrolledLayout({ sections, tocLabel = 'Sekcje' }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = body!;
      const secs = sectionsRef.current;
      if (!secs.length) return;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setActiveSection(secs[secs.length - 1]!.id);
        return;
      }
      const containerTop = body!.getBoundingClientRect().top;
      let current = secs[0]!.id;
      for (const { id } of secs) {
        const el = body!.querySelector<HTMLElement>(`#sec-${id}`);
        if (el && el.getBoundingClientRect().top - containerTop <= 40) {
          current = id;
        }
      }
      setActiveSection(current);
    }

    body.addEventListener('scroll', onScroll, { passive: true });
    return () => body.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToSection(id: string) {
    const body = bodyRef.current;
    const el = body?.querySelector<HTMLElement>(`#sec-${id}`);
    if (!body || !el) return;
    const top =
      el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 24;
    body.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    <div className={styles.split}>
      <nav className={styles.toc} aria-label="Spis treści">
        <Text variant="nano" as="span" weight="bold" color="muted" className={styles.tocLabel}>
          {tocLabel}
        </Text>
        {sections.map(({ id, num, label, danger }) => (
          <button
            key={id}
            type="button"
            className={[
              styles.tocItem,
              activeSection === id ? styles.tocActive : '',
              danger ? styles.tocDanger : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => scrollToSection(id)}
          >
            <Text variant="nano" as="span" mono className={styles.tocNum}>
              {num}
            </Text>
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.body} ref={bodyRef}>
        {sections.map(({ id, sectionClassName, content }) => (
          <section
            key={id}
            id={`sec-${id}`}
            className={[styles.section, sectionClassName].filter(Boolean).join(' ')}
          >
            {content}
          </section>
        ))}
      </div>
    </div>
  );
}
