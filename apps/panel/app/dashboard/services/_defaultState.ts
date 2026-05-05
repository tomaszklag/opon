import type { ServicesPageState } from './_types';

export const DEFAULT_SERVICES_STATE: ServicesPageState = {
  groups: [
    {
      id: 'g-wymiana',
      name: 'Wymiana sezonowa',
      pricingMode: 'PER_SET',
      sortOrder: 0,
      variants: [
        {
          id: 'v-osobowe',
          name: 'Osobowe',
          enabled: true,
          sortOrder: 0,
          rimTiers: [
            {
              id: 't-r13-15',
              rimSizes: ['R13', 'R14', 'R15'],
              pricePln: '180',
              durationMinutes: '40',
              sortOrder: 0,
            },
            {
              id: 't-r16-17',
              rimSizes: ['R16', 'R17'],
              pricePln: '210',
              durationMinutes: '45',
              sortOrder: 1,
            },
          ],
          subServices: [
            {
              id: 'ss-wazenie',
              name: 'Wyważanie',
              included: true,
              enabled: true,
              fromCatalog: true,
              // inherit — kłódka zamknięta
              pricePln: null,
              durationMinutes: null,
              sortOrder: 0,
            },
            {
              id: 'ss-wentyl',
              name: 'Nowy wentyl',
              included: false,
              enabled: true,
              fromCatalog: false,
              // override aktywny — własna cena i czas
              pricePln: '10',
              durationMinutes: '5',
              sortOrder: 1,
            },
            {
              id: 'ss-przechowanie',
              name: 'Przechowanie opon',
              included: false,
              enabled: true,
              fromCatalog: true,
              // inherit — kłódka zamknięta
              pricePln: null,
              durationMinutes: null,
              sortOrder: 2,
            },
          ],
        },
        {
          id: 'v-suv',
          name: 'SUV / Crossover',
          enabled: true,
          sortOrder: 1,
          rimTiers: [
            {
              id: 't-suv-r18-20',
              rimSizes: ['R18', 'R19', 'R20'],
              pricePln: '260',
              durationMinutes: '50',
              sortOrder: 0,
            },
            {
              id: 't-suv-r21-22',
              rimSizes: ['R21', 'R22'],
              pricePln: '310',
              durationMinutes: '55',
              sortOrder: 1,
            },
          ],
          subServices: [
            {
              id: 'ss-suv-wazenie',
              name: 'Wyważanie',
              included: true,
              enabled: true,
              fromCatalog: true,
              pricePln: null,
              durationMinutes: null,
              sortOrder: 0,
            },
          ],
        },
        {
          id: 'v-dostawcze',
          name: 'Dostawcze ≤ 3.5t',
          enabled: true,
          sortOrder: 2,
          rimTiers: [
            {
              id: 't-dos-r16-22',
              rimSizes: ['R16', 'R17', 'R18', 'R19', 'R20', 'R21', 'R22'],
              pricePln: '380',
              durationMinutes: '60',
              sortOrder: 0,
            },
          ],
          subServices: [],
        },
        {
          id: 'v-tir',
          name: 'TIR / Ciężarowe',
          enabled: false,
          sortOrder: 3,
          rimTiers: [],
          subServices: [],
        },
      ],
    },
    {
      id: 'g-wazenie',
      name: 'Wyważanie',
      pricingMode: 'PER_WHEEL',
      sortOrder: 1,
      variants: [
        {
          id: 'vw-osobowe',
          name: 'Osobowe',
          enabled: true,
          sortOrder: 0,
          rimTiers: [
            {
              id: 'tw-r13-15',
              rimSizes: ['R13', 'R14', 'R15'],
              pricePln: '25',
              durationMinutes: '10',
              sortOrder: 0,
            },
            {
              id: 'tw-r16-17',
              rimSizes: ['R16', 'R17'],
              pricePln: '30',
              durationMinutes: '12',
              sortOrder: 1,
            },
          ],
          subServices: [],
        },
        {
          id: 'vw-suv',
          name: 'SUV / Crossover',
          enabled: true,
          sortOrder: 1,
          rimTiers: [
            {
              id: 'tw-suv-r18-22',
              rimSizes: ['R18', 'R19', 'R20', 'R21', 'R22'],
              pricePln: '35',
              durationMinutes: '15',
              sortOrder: 0,
            },
          ],
          subServices: [],
        },
      ],
    },
  ],
  surcharges: [
    {
      id: 'sc-runflat',
      name: 'Run-Flat',
      enabled: true,
      scope: 'PER_WHEEL',
      pricePln: '20',
      sortOrder: 0,
    },
    {
      id: 'sc-lowprofile',
      name: 'Low-Profile ≤35',
      enabled: true,
      scope: 'PER_WHEEL',
      pricePln: '10',
      sortOrder: 1,
    },
    {
      id: 'sc-tpms',
      name: 'TPMS obsługa',
      enabled: false,
      scope: 'PER_SENSOR',
      pricePln: '15',
      sortOrder: 2,
    },
  ],
};
