'use client';

import { useState } from 'react';
import { Text } from '@opony/design-system-web';
import { IconPlus } from '../../../../components/icons';
import { AddonCard } from './AddonCard';
import type { AddonState } from '../_types';
import styles from './AddonCollection.module.css';

interface Props {
  addons: AddonState[];
  onChange: (updated: AddonState[]) => void;
  onDeleteAddon: (id: string, name: string) => void;
  onToggleAddon: (id: string) => void;
}

export function AddonCollection({ addons, onChange, onDeleteAddon, onToggleAddon }: Props) {
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  function handleAdd() {
    const newId = Math.random().toString(36).slice(2);
    const newAddon: AddonState = {
      id: newId,
      name: '',
      pricePln: '',
      durationMinutes: null,
      enabled: true,
      sortOrder: addons.length,
    };
    onChange([...addons, newAddon]);
    setNewlyCreatedId(newId);
  }

  function updateAddon(id: string, updated: AddonState) {
    onChange(addons.map((a) => (a.id === id ? updated : a)));
  }

  return (
    <div className={styles.wrap}>
      {addons.map((addon) => (
        <AddonCard
          key={addon.id}
          addon={addon}
          onChange={(updated) => updateAddon(addon.id, updated)}
          onDelete={() => onDeleteAddon(addon.id, addon.name)}
          onToggle={() => onToggleAddon(addon.id)}
          defaultOpen={addon.id === newlyCreatedId}
        />
      ))}

      <button className={styles.addBtn} onClick={handleAdd}>
        <IconPlus width="12" height="12" />
        <Text variant="nano" as="span" weight="bold" color="accent">
          Dodaj dodatek
        </Text>
      </button>
    </div>
  );
}
