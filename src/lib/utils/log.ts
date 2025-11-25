export const devLog = (...args: unknown[]) => {
  if (!import.meta.env.DEV) return;
  // eslint-disable-next-line no-console
  console.log('[DEV]', ...args);
};
