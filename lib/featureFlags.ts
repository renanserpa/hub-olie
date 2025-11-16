export function externalAIEnabled(): boolean {
  try {
    // Vite exposes env as import.meta.env but Node uses process.env
    // Support both for flexibility in dev and CI
    const viteFlag = typeof (globalThis as any).importMeta !== 'undefined' ? (globalThis as any).importMeta?.env?.VITE_ENABLE_EXTERNAL_AI : undefined;
    const envFlag = typeof process !== 'undefined' ? process.env.ENABLE_EXTERNAL_AI || process.env.VITE_ENABLE_EXTERNAL_AI : undefined;
    const flag = viteFlag ?? envFlag;
    if (flag === undefined || flag === null) return false;
    if (typeof flag === 'string') return ['1', 'true', 'yes', 'on'].includes(flag.toLowerCase());
    return Boolean(flag);
  } catch (e) {
    return false;
  }
}
