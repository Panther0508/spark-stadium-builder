/**
 * Retry utility with exponential backoff
 * Retries a function up to 3 times with delays: 1s, 3s, 9s
 */

export type RetryableFunction = () => Promise<unknown>;

const RETRY_DELAYS = [1000, 3000, 9000];
const MAX_RETRIES = RETRY_DELAYS.length;

export async function withRetry<T>(
  fn: RetryableFunction,
  fallbackValue?: T
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fn();
      return result as T;
    } catch (error) {
      lastError = error;

      // Don't retry on final attempt
      if (attempt === MAX_RETRIES) break;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  // All retries failed
  console.error('All retry attempts failed:', lastError);

  if (fallbackValue !== undefined) {
    return fallbackValue;
  }

  throw lastError;
}
