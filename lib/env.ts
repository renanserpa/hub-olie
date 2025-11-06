import { runtime } from './runtime';

export const ENV = {
  APP_ENV: runtime.mode,
};

export const isSandbox = (): boolean => ENV.APP_ENV === 'SANDBOX';