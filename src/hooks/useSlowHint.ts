import { useEffect, useState } from "react";

/** True once `delayMs` has passed while mounted, e.g. to explain a slow first load. */
export const useSlowHint = (delayMs = 5000): boolean => {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return slow;
};
