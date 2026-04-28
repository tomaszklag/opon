import { Heading } from '@opony/design-system-web';
import { type UseFormReturn } from 'react-hook-form';
import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import { type NewTierValues } from '../../../../lib/schemas/pricing.schema';
import { TierRow } from './TierRow';
import { NewTierForm } from './NewTierForm';
import styles from '../pricing.module.css';

interface Props {
  drafts: TierDraft[];
  showAddForm: boolean;
  newTierForm: UseFormReturn<NewTierValues>;
  errors: string[];
  onUpdate: (idx: number, patch: Partial<TierDraft>) => void;
  onDelete: (idx: number) => void;
  onCancelAdd: () => void;
}

export function TierList({
  drafts,
  showAddForm,
  newTierForm,
  errors,
  onUpdate,
  onDelete,
  onCancelAdd,
}: Props) {
  return (
    <>
      <section className={styles.secCard}>
        <div className={styles.secHead}>
          <Heading variant="section" as="h2" className={styles.secTitle}>
            Wymiana 4 opon
          </Heading>
          <span className={styles.secSub}>Cena za komplet · PLN</span>
        </div>

        {drafts.length === 0 && !showAddForm && (
          <p className={styles.emptyState}>
            Brak zdefiniowanych przedziałów. Kliknij &bdquo;Dodaj przedział&rdquo; aby rozpocząć.
          </p>
        )}

        {drafts.map((d, idx) => (
          <TierRow
            key={d.id ?? `draft-${idx}`}
            draft={d}
            idx={idx}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {showAddForm && <NewTierForm form={newTierForm} onCancel={onCancelAdd} />}
      </section>

      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </>
  );
}
