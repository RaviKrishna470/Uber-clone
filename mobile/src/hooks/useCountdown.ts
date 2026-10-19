import { useCallback, useEffect, useState } from 'react';

/** Seconds remaining, ticking once per second. `restart(n)` starts a new countdown. */
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const restart = useCallback((n: number) => setSeconds(n), []);
  return { seconds, restart, done: seconds <= 0 };
}
