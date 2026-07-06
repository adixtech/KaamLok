import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown timer hook. Returns seconds remaining, a start function,
 * and whether the countdown is active. Used by OTP resend and verify flows.
 */
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (from = initialSeconds) => {
      setSeconds(from);
      setActive(true);
      clear();
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clear();
            setActive(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [initialSeconds, clear]
  );

  useEffect(() => () => clear(), [clear]);

  return { seconds, active, start, reset: () => start(initialSeconds) };
}
