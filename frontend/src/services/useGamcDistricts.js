import { useEffect, useState } from "react";
import { fetchGamcDistricts } from "./gamcClient.js";

/** GAMC districts for the selectors; empty while loading or when the API is unreachable. */
export function useGamcDistricts(enabled = true) {
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    fetchGamcDistricts()
      .then((list) => {
        if (!cancelled) setDistricts(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return districts;
}

