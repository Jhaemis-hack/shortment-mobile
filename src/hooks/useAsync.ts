import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: unknown };

/**
 * Runs `load` on mount and whenever `deps` change; ignores results from stale runs.
 * `reload()` re-runs it, e.g. for a "Try again" button or pull-to-refresh.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo -- callers pass the inputs `load` closes over */
  const run = useCallback(load, deps);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/use-memo */

  useEffect(() => {
    let active = true;
    // Reset to loading for each new run (deps change or reload).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    run().then(
      data => active && setState({ status: "success", data }),
      (error: unknown) => active && setState({ status: "error", error }),
    );
    return () => {
      active = false;
    };
  }, [run, attempt]);

  const reload = useCallback(() => setAttempt(n => n + 1), []);
  return { ...state, reload, setData: (data: T) => setState({ status: "success", data }) };
}
