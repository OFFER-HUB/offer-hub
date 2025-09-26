// src/hooks/useAsyncData.ts
import { useState, useCallback, useEffect, useRef } from "react";

type MaybePromiseFn<T> = (signal?: AbortSignal | null) => Promise<T> | T;

/**
 * useAsyncData
 * - supports sync or async functions
 * - passes an AbortSignal to the function when available so callers can cancel fetches
 * - avoids state updates after unmount
 */
export function useAsyncData<T = unknown>(
  fn: MaybePromiseFn<T>,
  deps: React.DependencyList = [],
  options: { initialData?: T | null; initialLoading?: boolean } = {}
) {
  const { initialData = null, initialLoading = false } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<unknown | null>(null);

  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // cancel any in-flight request when unmounting
      controllerRef.current?.abort();
    };
  }, []);

  const run = useCallback(
    async (overrideFn?: MaybePromiseFn<T>) => {
  const call = overrideFn ?? fn;
      if (!call) return null as any;

      // cancel previous controller and create a new one for this run
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const res = await Promise.resolve(call(controller.signal));
        if (mountedRef.current) setData(res as T);
        return res;
      } catch (err: any) {
        // treat AbortError as a non-error for state setting
        if (err && (err as any).name === 'AbortError') {
          // swallow
          return Promise.reject(err);
        }
        if (mountedRef.current) setError(err);
        throw err;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    // deps are provided by caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, ...deps]
  );

  useEffect(() => {
    // automatically run on mount / when deps change
    run().catch(() => {
      /* swallow here */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { data, setData, loading, setLoading, error, setError, run };
}