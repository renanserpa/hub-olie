import { RUNTIME } from './runtime';

export const ENV = {
  APP_ENV: RUNTIME,
};

export const isSandbox = (): boolean => ENV.APP_ENV === 'SANDBOX';
