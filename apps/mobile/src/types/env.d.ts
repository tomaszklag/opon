declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_SENTRY_DSN_MOBILE?: string;
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    EXPO_PUBLIC_API_MOCK?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
