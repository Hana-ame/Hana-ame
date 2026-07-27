import { useRef, useCallback } from "react";

export function useThrottle<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
) {
  const lastCall = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  const pendingArgs = useRef<Parameters<T> | null>(null);

  fnRef.current = fn;

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      if (remaining <= 0) {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        lastCall.current = now;
        fnRef.current(...args);
      } else {
        pendingArgs.current = args;
        if (timerRef.current === null) {
          timerRef.current = setTimeout(() => {
            timerRef.current = null;
            if (pendingArgs.current) {
              lastCall.current = Date.now();
              fnRef.current(...pendingArgs.current);
              pendingArgs.current = null;
            }
          }, remaining);
        }
      }
    },
    [delay],
  );

  return throttled;
}
