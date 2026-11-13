import { useEffect, useState } from 'react';

/** `value` trimmed, once it has stopped changing for `ms`. */
export function useDebounced(value: string, ms = 300) {
  const [v, setV] = useState(value.trim());
  useEffect(() => {
    const t = setTimeout(() => setV(value.trim()), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
