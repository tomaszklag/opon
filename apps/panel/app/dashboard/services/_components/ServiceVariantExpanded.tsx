'use client';

import { useEffect, useRef, useState } from 'react';
import { Input, Text, NumberStepper } from '@opony/design-system-web';
import { IconPlus, IconXClose, IconTrash } from '../../../../components/icons';
import { RimTierRow } from './RimTierRow';
import { ServiceVariantRow } from './ServiceVariantRow';
import { PriceTag } from './PriceTag';
import type { ServiceState, ServiceVariantState, AddonState } from '../_types';
import styles from './ServiceVariantExpanded.module.css';

interface Props {
  service: ServiceState;
  allServices: ServiceState[];
  allAddons: AddonState[];
  onChange: (updated: ServiceState) => void;
}

export function ServiceVariantExpanded({ service, allServices, allAddons, onChange }: Props) {
  const [lastAddedVariantId, setLastAddedVariantId] = useState<string | null>(null);
  const [subDropdown, setSubDropdown] = useState(false);
  const [addonDropdown, setAddonDropdown] = useState(false);
  const flatVariantForInit = service.variants[0];
  const [flatWheelOpen, setFlatWheelOpen] = useState(
    !!(flatVariantForInit?.pricePerWheelPln || flatVariantForInit?.durationPerWheelMinutes),
  );
  const subWrapRef = useRef<HTMLDivElement>(null);
  const addonWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!subDropdown && !addonDropdown) return;
    function onMouseDown(e: MouseEvent) {
      if (subWrapRef.current && !subWrapRef.current.contains(e.target as Node)) {
        setSubDropdown(false);
      }
      if (addonWrapRef.current && !addonWrapRef.current.contains(e.target as Node)) {
        setAddonDropdown(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [subDropdown, addonDropdown]);

  function updateVariant(variantId: string, updated: ServiceVariantState) {
    onChange({
      ...service,
      variants: service.variants.map((v) => (v.id === variantId ? updated : v)),
    });
  }

  function deleteVariant(variantId: string) {
    onChange({ ...service, variants: service.variants.filter((v) => v.id !== variantId) });
  }

  function addVariant() {
    const newId = Math.random().toString(36).slice(2);
    const newVariant: ServiceVariantState = {
      id: newId,
      name: service.pricingType === 'VARIANTS' ? '' : null,
      rimSizes: [],
      pricePln: '',
      durationMinutes: '',
      pricePerWheelPln: '',
      durationPerWheelMinutes: '',
      sortOrder: service.variants.length,
    };
    onChange({ ...service, variants: [...service.variants, newVariant] });
    setLastAddedVariantId(newId);
  }

  function toggleSubService(subId: string) {
    const has = service.subServiceIds.includes(subId);
    onChange({
      ...service,
      subServiceIds: has
        ? service.subServiceIds.filter((id) => id !== subId)
        : [...service.subServiceIds, subId],
    });
  }

  function toggleAddon(addonId: string) {
    const has = service.addonIds.includes(addonId);
    onChange({
      ...service,
      addonIds: has
        ? service.addonIds.filter((id) => id !== addonId)
        : [...service.addonIds, addonId],
    });
  }

  const flatVariant = service.variants[0];
  const otherServices = allServices.filter((s) => s.id !== service.id);

  return (
    <div className={styles.expanded}>
      {/* ── Name ── */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
          Nazwa
        </Text>
        <Input
          type="text"
          placeholder="Nazwa usługi…"
          value={service.name}
          onChange={(e) => onChange({ ...service, name: e.target.value })}
          aria-label="Nazwa usługi"
        />
      </div>

      {/* ── Pricing FLAT ── */}
      {service.pricingType === 'FLAT' && (
        <>
          <div className={styles.fieldRow}>
            <Text
              variant="nano"
              as="span"
              weight="bold"
              color="muted"
              className={styles.fieldLabel}
            >
              Cena
            </Text>
            <NumberStepper
              value={flatVariant?.pricePln ?? ''}
              onChange={(v) =>
                flatVariant && updateVariant(flatVariant.id, { ...flatVariant, pricePln: v })
              }
              unit="zł"
              min={0}
              step={5}
              inputWidth={64}
              aria-label="Cena kompletu w złotych"
            />
          </div>
          <div className={styles.fieldRow}>
            <Text
              variant="nano"
              as="span"
              weight="bold"
              color="muted"
              className={styles.fieldLabel}
            >
              Czas
            </Text>
            <NumberStepper
              value={flatVariant?.durationMinutes ?? ''}
              onChange={(v) =>
                flatVariant && updateVariant(flatVariant.id, { ...flatVariant, durationMinutes: v })
              }
              unit="min"
              min={0}
              step={5}
              inputWidth={52}
              aria-label="Czas trwania kompletu"
            />
          </div>
          {flatWheelOpen ? (
            <>
              <div className={styles.fieldRow}>
                <Text
                  variant="nano"
                  as="span"
                  weight="bold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Cena (1 koło)
                </Text>
                <div className={styles.wheelFieldWrap}>
                  <NumberStepper
                    value={flatVariant?.pricePerWheelPln ?? ''}
                    onChange={(v) =>
                      flatVariant &&
                      updateVariant(flatVariant.id, { ...flatVariant, pricePerWheelPln: v })
                    }
                    unit="zł"
                    min={0}
                    step={1}
                    inputWidth={64}
                    aria-label="Cena za jedno koło"
                  />
                  {!flatVariant?.pricePerWheelPln && flatVariant?.pricePln && (
                    <Text variant="nano" as="span" color="muted">
                      {(() => {
                        const v = parseFloat(flatVariant.pricePln);
                        const per = Math.round((v / 4) * 100) / 100;
                        return (
                          '= ' +
                          (Number.isInteger(per) ? String(per) : per.toFixed(2).replace('.', ',')) +
                          ' zł'
                        );
                      })()}
                    </Text>
                  )}
                </div>
              </div>
              <div className={styles.fieldRow}>
                <Text
                  variant="nano"
                  as="span"
                  weight="bold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Czas (1 koło)
                </Text>
                <div className={styles.wheelFieldWrap}>
                  <NumberStepper
                    value={flatVariant?.durationPerWheelMinutes ?? ''}
                    onChange={(v) =>
                      flatVariant &&
                      updateVariant(flatVariant.id, { ...flatVariant, durationPerWheelMinutes: v })
                    }
                    unit="min"
                    min={0}
                    step={1}
                    inputWidth={52}
                    aria-label="Czas za jedno koło"
                  />
                  {!flatVariant?.durationPerWheelMinutes && flatVariant?.durationMinutes && (
                    <Text variant="nano" as="span" color="muted">
                      = {Math.round(parseInt(flatVariant.durationMinutes, 10) / 4)} min
                    </Text>
                  )}
                </div>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel} />
                <button
                  className={styles.removeWheelBtn}
                  onClick={() => {
                    if (flatVariant) {
                      updateVariant(flatVariant.id, {
                        ...flatVariant,
                        pricePerWheelPln: '',
                        durationPerWheelMinutes: '',
                      });
                    }
                    setFlatWheelOpen(false);
                  }}
                >
                  <IconTrash width="10" height="10" />
                  usuń nadpisanie za koło
                </button>
              </div>
            </>
          ) : (
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel} />
              <button className={styles.addWheelBtn} onClick={() => setFlatWheelOpen(true)}>
                + nadpisz cenę za 1 koło
                {(flatVariant?.pricePln || flatVariant?.durationMinutes) && (
                  <span className={styles.addWheelHint}>
                    {(() => {
                      const price = parseFloat(flatVariant?.pricePln ?? '');
                      const dur = parseInt(flatVariant?.durationMinutes ?? '', 10);
                      const parts: string[] = [];
                      if (price) {
                        const per = Math.round((price / 4) * 100) / 100;
                        parts.push(
                          (Number.isInteger(per) ? String(per) : per.toFixed(2).replace('.', ',')) +
                            ' zł',
                        );
                      }
                      if (dur) parts.push(Math.round(dur / 4) + ' min');
                      return '(' + parts.join(' · ') + ')';
                    })()}
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Pricing VARIANTS ── */}
      {service.pricingType === 'VARIANTS' && (
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Warianty
          </Text>
          <div className={styles.variantContent}>
            <div className={styles.variantsList}>
              {service.variants.map((v) => (
                <ServiceVariantRow
                  key={v.id}
                  variant={v}
                  onChange={(updated) => updateVariant(v.id, updated)}
                  onDelete={() => deleteVariant(v.id)}
                  autoFocusName={v.id === lastAddedVariantId}
                />
              ))}
            </div>
            <button className={styles.addTierBtn} onClick={addVariant}>
              <IconPlus width="9" height="9" />
              <Text variant="nano" as="span">
                Dodaj wariant
              </Text>
            </button>
          </div>
        </div>
      )}

      {/* ── Pricing RIM_SIZES ── */}
      {service.pricingType === 'RIM_SIZES' && (
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Rozmiary
          </Text>
          <div className={styles.variantContent}>
            <div className={styles.rimTiers}>
              {service.variants.map((v) => (
                <RimTierRow
                  key={v.id}
                  tier={v}
                  onChange={(updated) => updateVariant(v.id, updated)}
                  onDelete={() => deleteVariant(v.id)}
                />
              ))}
            </div>
            <button className={styles.addTierBtn} onClick={addVariant}>
              <IconPlus width="9" height="9" />
              <Text variant="nano" as="span">
                Dodaj zakres
              </Text>
            </button>
          </div>
        </div>
      )}

      {/* ── Sub-services ── */}
      {otherServices.length > 0 && (
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Sugerowane podusługi
          </Text>
          <div className={styles.chipsWrap}>
            <div className={styles.chips}>
              {service.subServiceIds.map((id) => {
                const sub = otherServices.find((s) => s.id === id);
                if (!sub) return null;
                return (
                  <span
                    key={id}
                    className={`${styles.chip}${!sub.enabled ? ' ' + styles.chipDisabled : ''}`}
                  >
                    <Text variant="nano" as="span">
                      {sub.name}
                    </Text>
                    <button
                      className={styles.chipX}
                      onClick={() => toggleSubService(id)}
                      aria-label={`Usuń ${sub.name}`}
                    >
                      <IconXClose width="8" height="8" />
                    </button>
                  </span>
                );
              })}

              <div className={styles.chipAddWrap} ref={subWrapRef}>
                {(service.subServiceIds.length < otherServices.length || subDropdown) && (
                  <button
                    className={styles.chipAdd}
                    onClick={() => setSubDropdown((v) => !v)}
                    aria-label="Dodaj podusługę"
                    aria-expanded={subDropdown}
                  >
                    <IconPlus width="7" height="7" />
                  </button>
                )}
                {subDropdown && (
                  <div className={styles.subDropdown}>
                    {otherServices
                      .filter((s) => !service.subServiceIds.includes(s.id))
                      .map((s) => (
                        <button
                          key={s.id}
                          className={styles.subOption}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            toggleSubService(s.id);
                          }}
                        >
                          <Text variant="nano" as="span">
                            {s.name}
                          </Text>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Addons ── */}
      {allAddons.length > 0 && (
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Opcjonalne dodatki
          </Text>
          <div className={styles.chipsWrap}>
            <div className={styles.chips}>
              {service.addonIds.map((id) => {
                const addon = allAddons.find((a) => a.id === id);
                if (!addon) return null;
                return (
                  <span
                    key={id}
                    className={`${styles.chip}${!addon.enabled ? ' ' + styles.chipDisabled : ''}`}
                  >
                    <Text variant="nano" as="span">
                      {addon.name}
                    </Text>
                    {parseFloat(addon.pricePln) > 0 && (
                      <PriceTag value={parseFloat(addon.pricePln)} prefix="+" muted />
                    )}
                    <button
                      className={styles.chipX}
                      onClick={() => toggleAddon(id)}
                      aria-label={`Usuń ${addon.name}`}
                    >
                      <IconXClose width="8" height="8" />
                    </button>
                  </span>
                );
              })}

              {service.addonIds.length < allAddons.length && (
                <div className={styles.chipAddWrap} ref={addonWrapRef}>
                  <button
                    className={styles.chipAdd}
                    onClick={() => setAddonDropdown((v) => !v)}
                    aria-label="Dodaj dodatek"
                    aria-expanded={addonDropdown}
                  >
                    <IconPlus width="7" height="7" />
                  </button>
                  {addonDropdown && (
                    <div className={styles.subDropdown}>
                      {allAddons
                        .filter((a) => !service.addonIds.includes(a.id))
                        .map((a) => (
                          <button
                            key={a.id}
                            className={styles.subOption}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleAddon(a.id);
                            }}
                          >
                            <Text variant="nano" as="span">
                              {a.name}
                            </Text>
                            {parseFloat(a.pricePln) > 0 && (
                              <PriceTag value={parseFloat(a.pricePln)} prefix="+" muted />
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
