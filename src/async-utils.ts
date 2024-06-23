export async function retryWithExponentialBackoff<T>(
  apiCall: () => {
    execute: () => Promise<T>;
    onError?: (error: any) => void;
  },
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let retries = 0;
  let delay = delayMs;

  while (retries < maxRetries) {
    const { execute, onError } = apiCall();
    try {
      const result = await execute();
      return result;
    } catch (error) {
      onError?.(error);

      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
      delay *= 2; // Exponential backoff

      if (retries === maxRetries) {
        throw new Error('Max retries exceeded');
      }
    }
  }

  throw new Error('Max retries exceeded');
}
