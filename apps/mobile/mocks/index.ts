// eslint-disable-next-line @typescript-eslint/no-var-requires
const { server } = require('./native') as typeof import('./native');

// Wywołaj initMsw() na poziomie modułu w app/_layout.tsx (przed renderem):
// import { initMsw } from '../mocks';
// initMsw();
//
// Warunek: EXPO_PUBLIC_API_MOCK=true
// Metro bundler rozwiązuje import synchronicznie — server jest gotowy przed pierwszym requestem.
export function initMsw(): void {
  if (process.env.EXPO_PUBLIC_API_MOCK !== 'true') return;
  server.listen({ onUnhandledRequest: 'warn' });
}
