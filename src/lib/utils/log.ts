export const devLog = (...args: unknown[]) => {
  if (import.meta.env.PROD) return;
  // eslint-disable-next-line no-console
  console.log('[OlieHub]', ...args);
};
