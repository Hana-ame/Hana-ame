import { useEffect, useRef, useCallback } from "react";

export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): { run: (...args: Parameters<T>) => void; cancel: () => void; flush: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  const argsRef = useRef<Parameters<T> | null>(null);
  const pendingRef = useRef(false);

  fnRef.current = fn;

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = false;
    argsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (pendingRef.current && argsRef.current) {
      cancel();
      fnRef.current(...argsRef.current);
      argsRef.current = null;
      pendingRef.current = false;
    }
  }, [cancel]);

  const run = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      pendingRef.current = true;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingRef.current = false;
        fnRef.current(...args);
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { run, cancel, flush };
}
