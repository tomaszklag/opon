// Wywołaj initMsw() na poziomie modułu w app/_layout.tsx (przed renderem):
// import { initMsw } from '../mocks';
// initMsw();
//
// Warunek: EXPO_PUBLIC_API_MOCK=true
// require('./native') jest WEWNĄTRZ initMsw — rettime/MessageEvent nie jest ładowane
// gdy MSW jest wyłączony (EXPO_PUBLIC_API_MOCK=false).
export function initMsw(): void {
  if (process.env.EXPO_PUBLIC_API_MOCK !== 'true') return;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { server } = require('./native') as typeof import('./native');
  server.listen({ onUnhandledRequest: 'warn' });
}
