export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export function getCacheTTL(seconds: number = 3600): number {
  return seconds;
}

export function parseCacheKey(key: string): { prefix: string; parts: string[] } {
  const parts = key.split(':');
  const prefix = parts[0] || '';
  const remainingParts = parts.slice(1);
  return { prefix, parts: remainingParts };
}
