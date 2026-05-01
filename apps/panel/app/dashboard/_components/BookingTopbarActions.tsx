'use client';

import { Button } from '@opony/design-system-web';
import { IconDownload, IconPlus } from '../../../components/icons';

interface BookingTopbarActionsProps {
  exportLabel?: string;
  addLabel?: string;
  onExport?: () => void;
  onAdd?: () => void;
  onAddTask?: () => void;
}

export function BookingTopbarActions({
  exportLabel = 'Eksport .ics',
  addLabel = 'Wizyta ręczna',
  onExport,
  onAdd,
  onAddTask,
}: BookingTopbarActionsProps) {
  return (
    <>
      <Button variant="ghost" size="sm" onClick={onExport}>
        <IconDownload width="13" height="13" />
        {exportLabel}
      </Button>
      {onAddTask && (
        <Button variant="secondary" size="sm" onClick={onAddTask}>
          <IconPlus width="13" height="13" />
          Dodaj zadanie
        </Button>
      )}
      <Button variant="primary" size="sm" onClick={onAdd}>
        <IconPlus width="13" height="13" />
        {addLabel}
      </Button>
    </>
  );
}
