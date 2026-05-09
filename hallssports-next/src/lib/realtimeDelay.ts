/**
 * Get a random delay value (5-15 seconds) that is computed once per page load.
 * This ensures all Realtime connections on the page share the same staggered delay.
 */
let realtimeDelay: number | undefined;

export function getRealtimeConnectionDelay(): number {
  if (typeof window === 'undefined') return 0;

  if (realtimeDelay === undefined) {
    realtimeDelay = Math.random() * (15000 - 5000) + 5000;
  }

  return realtimeDelay;
}
