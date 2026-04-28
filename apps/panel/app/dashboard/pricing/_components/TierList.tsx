import { Heading, Text, NoticeBlock } from '@opony/design-system-web';
import { type UseFormReturn } from 'react-hook-form';
import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import { type MarketPrice, getMarketRef } from '../../../../lib/hooks/use-market-prices';
import { type NewTierValues } from '../../../../lib/schemas/pricing.schema';
import { TierRow } from './TierRow';
import { NewTierForm } from './NewTierForm';
import styles from '../pricing.module.css';

function isPopularTier(rimSizeMin: number, rimSizeMax: number): boolean {
  return rimSizeMin >= 16 && rimSizeMax <= 17;
}

function tierDescription(rimSizeMin: number, rimSizeMax: number): string {
  if (rimSizeMax <= 15) return 'Samochody miejskie, starsze modele';
  if (rimSizeMin >= 16 && rimSizeMax <= 17)
    return 'Kompakty i segment C/D — Focus, Octavia, Passat';
  if (rimSizeMin >= 18) return 'SUV-y i auta premium';
  return '';
}

interface Props {
  drafts: TierDraft[];
  showAddForm: boolean;
  newTierForm: UseFormReturn<NewTierValues>;
  errors: string[];
  marketPrices: MarketPrice[];
  onUpdate: (idx: number, patch: Partial<TierDraft>) => void;
  onDelete: (idx: number) => void;
  onCancelAdd: () => void;
}

export function TierList({
  drafts,
  showAddForm,
  newTierForm,
  errors,
  marketPrices,
  onUpdate,
  onDelete,
  onCancelAdd,
}: Props) {
  return (
    <>
      <section className={styles.secCard} aria-labelledby="sec-swap">
        <div className={styles.secHead}>
          <Heading variant="section" as="h2" id="sec-swap" className={styles.secTitle}>
            Wymiana 4 opon
          </Heading>
          <span className={styles.secSub}>3 widełki rozmiaru felgi · PLN za komplet</span>
        </div>

        {drafts.length === 0 && !showAddForm && (
          <Text variant="body-sm" as="p" color="muted" className={styles.emptyState}>
            Brak zdefiniowanych przedziałów. Kliknij &bdquo;Dodaj przedział&rdquo; aby rozpocząć.
          </Text>
        )}

        {drafts.map((d, idx) => (
          <TierRow
            key={d.id ?? `draft-${idx}`}
            draft={d}
            idx={idx}
            popular={isPopularTier(d.rimSizeMin, d.rimSizeMax)}
            description={tierDescription(d.rimSizeMin, d.rimSizeMax)}
            marketRef={getMarketRef(marketPrices, d.rimSizeMin, d.rimSizeMax)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {showAddForm && <NewTierForm form={newTierForm} onCancel={onCancelAdd} />}
      </section>

      {errors.length > 0 && (
        <NoticeBlock variant="danger">
          {errors.map((e, i) => (
            <Text key={i} variant="body-sm" as="p">
              {e}
            </Text>
          ))}
        </NoticeBlock>
      )}
    </>
  );
}
