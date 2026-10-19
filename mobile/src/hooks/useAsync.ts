import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '@/utils/appError';

/** Wraps an async action with loading + error state. Taps while a call is in flight are ignored. */
export function useAsync<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      if (inFlight.current) return undefined;
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        setError(getErrorMessage(e));
        return undefined;
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [fn],
  );

  return { run, loading, error, setError };
}
