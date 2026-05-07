'use client';

import { useEffect, useRef, useState } from 'react';
import { Input, Text, NumberStepper } from '@opony/design-system-web';
import {
  IconPlus,
  IconXClose,
  IconDollar,
  IconList,
  IconRim,
  IconLinkChain,
  IconPlusCircle,
} from '../../../../components/icons';
import { RimTierRow } from './RimTierRow';
import { ServiceVariantRow } from './ServiceVariantRow';
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
      <Input
        type="text"
        placeholder="Nazwa usługi…"
        value={service.name}
        onChange={(e) => onChange({ ...service, name: e.target.value })}
        aria-label="Nazwa usługi"
      />

      {/* ── Pricing section ── */}
      {service.pricingType === 'FLAT' && (
        <>
          <div className={styles.expLabel}>
            <IconDollar width="8" height="8" />
            <Text variant="kicker-sm" as="span">
              Cena &amp; czas
            </Text>
            <span className={styles.line} />
          </div>
          <div className={styles.flatRow}>
            <NumberStepper
              value={flatVariant?.pricePln ?? ''}
              onChange={(v) =>
                flatVariant && updateVariant(flatVariant.id, { ...flatVariant, pricePln: v })
              }
              unit="zł"
              min={0}
              step={5}
              inputWidth={64}
              aria-label="Cena w złotych"
            />
            <NumberStepper
              value={flatVariant?.durationMinutes ?? ''}
              onChange={(v) =>
                flatVariant && updateVariant(flatVariant.id, { ...flatVariant, durationMinutes: v })
              }
              unit="min"
              min={0}
              step={5}
              inputWidth={52}
              aria-label="Czas trwania"
            />
          </div>
        </>
      )}

      {service.pricingType === 'VARIANTS' && (
        <>
          <div className={styles.expLabel}>
            <IconList width="8" height="8" />
            <Text variant="kicker-sm" as="span">
              Warianty
            </Text>
            <span className={styles.line} />
          </div>
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
        </>
      )}

      {service.pricingType === 'RIM_SIZES' && (
        <>
          <div className={styles.expLabel}>
            <IconRim width="8" height="8" />
            <Text variant="kicker-sm" as="span">
              Zakresy rozmiarów
            </Text>
            <span className={styles.line} />
          </div>
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
        </>
      )}

      {/* ── Sub-services ── */}
      {otherServices.length > 0 && (
        <>
          <div className={styles.expLabel}>
            <IconLinkChain width="8" height="8" />
            <Text variant="kicker-sm" as="span">
              Podusługi
            </Text>
            <span className={styles.line} />
            <Text variant="nano" as="span" color="secondary">
              sugerowane przy rezerwacji
            </Text>
          </div>
          <div className={styles.chips}>
            {service.subServiceIds.map((id) => {
              const sub = otherServices.find((s) => s.id === id);
              if (!sub) return null;
              return (
                <span key={id} className={styles.chip}>
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

            {service.subServiceIds.length < otherServices.length && (
              <div className={styles.chipAddWrap} ref={subWrapRef}>
                <button
                  className={styles.chipAdd}
                  onClick={() => setSubDropdown((v) => !v)}
                  aria-label="Dodaj podusługę"
                  aria-expanded={subDropdown}
                >
                  <IconPlus width="7" height="7" />
                </button>
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
            )}
          </div>
        </>
      )}

      {/* ── Addons ── */}
      {allAddons.length > 0 && (
        <>
          <div className={styles.expLabel}>
            <IconPlusCircle width="8" height="8" />
            <Text variant="kicker-sm" as="span">
              Dodatki
            </Text>
            <span className={styles.line} />
            <Text variant="nano" as="span" color="secondary">
              opcjonalne przy rezerwacji
            </Text>
          </div>
          <div className={styles.chips}>
            {service.addonIds.map((id) => {
              const addon = allAddons.find((a) => a.id === id);
              if (!addon) return null;
              return (
                <span key={id} className={styles.chip}>
                  <Text variant="nano" as="span">
                    {addon.name}
                  </Text>
                  {addon.pricePln && (
                    <Text variant="nano" as="span" color="secondary" mono>
                      +{addon.pricePln} zł
                    </Text>
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
                          {a.pricePln && (
                            <Text variant="nano" as="span" color="secondary" mono>
                              &nbsp;+{a.pricePln} zł
                            </Text>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
